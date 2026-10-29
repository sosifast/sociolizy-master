import { MongoClient, Db, Collection } from "mongodb";
import {
  getActiveClusterConfig,
  getServerUri,
  getDiscoveredServers,
  getActiveEnvMap,
  ServerNodeConfig,
} from "@/lib/server-db";

/**
 * Order SMM Document Schema directly mapped to MongoDB according to database.md
 */
export interface OrderSmmDocument {
  id: number;
  uuid_user: string;
  uuid_api_provider: string | null;
  service_id: string;
  invoice: string;
  order_id: string | null;
  amount: number;
  price_api: number;
  price_sale: number;
  target: string;
  remains: number;
  start: number;
  refill: boolean;
  status: string;
  server_area?: string | null;
  create_at: Date;
  update_at: Date;
}

export type OrderSmmMongo = OrderSmmDocument;

// Global cache for MongoClients per connection URI to prevent connection exhaustion in serverless/Next.js
const globalForMongo = globalThis as unknown as {
  mongoClients: Map<string, MongoClient> | undefined;
};

if (!globalForMongo.mongoClients) {
  globalForMongo.mongoClients = new Map<string, MongoClient>();
}

/**
 * Deterministic string hash algorithm for consistent user-to-shard distribution
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Normalizes region aliases (e.g. WDC -> DC, JAPAN -> JP)
 */
function normalizeRegionGroup(group: string): string {
  const g = group.toUpperCase().trim();
  if (g === "WDC") return "DC";
  if (g === "JAPAN") return "JP";
  if (g === "SIN") return "SG";
  return g;
}

/**
 * Retrieves all configured and active servers belonging to a specified region/group
 */
export function getServersForRegion(serverArea?: string): ServerNodeConfig[] {
  const servers = getDiscoveredServers().filter((s) => s.isConfigured);
  if (!serverArea) return servers;

  const target = serverArea.toUpperCase().trim();
  const normalizedTarget = normalizeRegionGroup(target);

  // 1. Exact Node Match (e.g. "SG_1", "SG_15", "WDC_5", "JP_12")
  const exact = servers.filter((s) => s.id === target);
  if (exact.length > 0) return exact;

  // 2. Region Group Match (e.g. "SG", "DC", "WDC", "JP", "JAPAN")
  const groupMatches = servers.filter((s) => {
    const sGroup = s.group.toUpperCase();
    return (
      sGroup === target ||
      sGroup === normalizedTarget ||
      normalizeRegionGroup(sGroup) === normalizedTarget
    );
  });

  return groupMatches;
}

/**
 * Automatically allocates a rolling, load-balanced MongoDB server node for a user in a chosen region.
 * Distributes user assignments evenly across all configured server nodes in that region so that
 * transaction storage and database query workloads are segmented on a per-user basis.
 */
export async function allocateRollingServerNode(requestedRegion: string = "SG"): Promise<{
  assignedNode: string;
  regionGroup: string;
  serverNode: ServerNodeConfig | null;
}> {
  const normGroup = normalizeRegionGroup(requestedRegion);
  const regionServers = getServersForRegion(normGroup);

  // 1. If no servers found for this region, fallback to any configured server or SG_1
  if (regionServers.length === 0) {
    const allConfigured = getDiscoveredServers().filter((s) => s.isConfigured);
    const fallbackNode = allConfigured[0]?.id || "SG_1";
    return {
      assignedNode: fallbackNode,
      regionGroup: normGroup,
      serverNode: allConfigured[0] || null,
    };
  }

  // 2. If the user already provided an exact node (e.g. "SG_2"), verify and return it
  const exact = regionServers.find((s) => s.id === requestedRegion.toUpperCase().trim());
  if (exact) {
    return {
      assignedNode: exact.id,
      regionGroup: exact.group,
      serverNode: exact,
    };
  }

  // 3. If only 1 server node configured in this region, assign it directly
  if (regionServers.length === 1) {
    return {
      assignedNode: regionServers[0].id,
      regionGroup: regionServers[0].group,
      serverNode: regionServers[0],
    };
  }

  // 4. If multiple servers exist in this region (e.g. SG_1, SG_2, SG_3...),
  // calculate current user allocation per node from PostgreSQL to pick the least-loaded node (rolling assignment)
  try {
    const { prisma } = await import("@/lib/prisma");
    const counts = await prisma.user.groupBy({
      by: ["server_area"],
      where: {
        server_area: { in: regionServers.map((s) => s.id) },
      },
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      if (c.server_area) {
        countMap.set(c.server_area, c._count.id);
      }
    });

    // Pick the node with minimum users
    let minCount = Infinity;
    let chosen = regionServers[0];

    for (const node of regionServers) {
      const current = countMap.get(node.id) || 0;
      if (current < minCount) {
        minCount = current;
        chosen = node;
      }
    }

    return {
      assignedNode: chosen.id,
      regionGroup: chosen.group,
      serverNode: chosen,
    };
  } catch (err) {
    // Fallback if DB query fails: pseudo-random rolling assignment
    const idx = Math.floor(Math.random() * regionServers.length);
    const chosen = regionServers[idx];
    return {
      assignedNode: chosen.id,
      regionGroup: chosen.group,
      serverNode: chosen,
    };
  }
}

/**
 * Automatically and dynamically resolves the target MongoDB server node and URI.
 * - Supports arbitrary number of servers per region (e.g. 10, 20, 30+ servers)
 * - Automatically load balances across servers in the same region using consistent user hashing
 * - Instantly discovers newly added servers from .env on the fly
 */
export function resolveMongoServer(
  serverArea?: string,
  userIdentifier?: string
): { uri: string; nodeId: string } | null {
  const env = getActiveEnvMap();
  const regionServers = getServersForRegion(serverArea);

  if (regionServers.length > 0) {
    // If region has multiple server nodes (e.g. 10 or 30 servers in SG, 15 in Japan, 5 in WDC):
    // Distribute members evenly across servers using deterministic hashing
    if (userIdentifier && regionServers.length > 1) {
      const shardIndex = hashString(userIdentifier) % regionServers.length;
      const chosen = regionServers[shardIndex];
      return { uri: chosen.uri, nodeId: chosen.id };
    }
    const chosen = regionServers[0];
    return { uri: chosen.uri, nodeId: chosen.id };
  }

  // Fallback to active cluster config
  const activeConfig = getActiveClusterConfig();
  if (activeConfig?.uri && !activeConfig.uri.includes("CHANGE_PASSWORD")) {
    return { uri: activeConfig.uri, nodeId: activeConfig.server };
  }

  // Fallback to any first configured server
  const allServers = getDiscoveredServers().filter((s) => s.isConfigured);
  if (allServers.length > 0 && allServers[0].uri) {
    return { uri: allServers[0].uri, nodeId: allServers[0].id };
  }

  const defaultUri =
    process.env.NEXT_GROUP_SERVER_SG_1_MONGODB_URI ||
    process.env.MONGODB_URI ||
    null;

  if (defaultUri) {
    return { uri: defaultUri, nodeId: "SG_1" };
  }

  return null;
}

/**
 * Resolves URI (backward compatibility)
 */
export function resolveMongoUri(serverArea?: string, userIdentifier?: string): string | null {
  const resolved = resolveMongoServer(serverArea, userIdentifier);
  return resolved?.uri || null;
}

/**
 * Get connected MongoDB Client for a specific serverArea or active cluster
 */
export async function getMongoClient(serverArea?: string, userIdentifier?: string): Promise<MongoClient | null> {
  const resolved = resolveMongoServer(serverArea, userIdentifier);
  if (!resolved?.uri) {
    console.warn(`[MongoDB] No valid MongoDB URI configured for area: "${serverArea}"`);
    return null;
  }

  const { uri } = resolved;
  const clients = globalForMongo.mongoClients!;
  if (clients.has(uri)) {
    return clients.get(uri)!;
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 15,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    clients.set(uri, client);
    return client;
  } catch (error) {
    console.error(`[MongoDB] Failed to connect to MongoDB (${resolved.nodeId}):`, error);
    return null;
  }
}

/**
 * Get MongoDB Database instance for a specific region/node
 */
export async function getMongoDb(
  serverArea?: string,
  userIdentifier?: string,
  dbName: string = "master_smm"
): Promise<Db | null> {
  const client = await getMongoClient(serverArea, userIdentifier);
  if (!client) return null;
  return client.db(dbName);
}

/**
 * Get typed collection for order_smm in MongoDB
 */
export async function getOrderSmmCollection(
  serverArea?: string,
  userIdentifier?: string
): Promise<Collection<OrderSmmDocument> | null> {
  const db = await getMongoDb(serverArea, userIdentifier);
  if (!db) return null;

  const collection = db.collection<OrderSmmDocument>("order_smm");

  // Ensure background indexes
  collection.createIndex({ id: 1 }, { unique: true, background: true }).catch(() => {});
  collection.createIndex({ invoice: 1 }, { unique: true, background: true }).catch(() => {});
  collection.createIndex({ uuid_user: 1, create_at: -1 }, { background: true }).catch(() => {});
  collection.createIndex({ uuid_api_provider: 1 }, { background: true }).catch(() => {});
  collection.createIndex({ server_area: 1 }, { background: true }).catch(() => {});
  collection.createIndex({ status: 1 }, { background: true }).catch(() => {});

  return collection;
}

/**
 * Sequential auto-increment integer generator per region database
 */
export async function getNextSequence(
  sequenceName: string,
  serverArea?: string,
  userIdentifier?: string
): Promise<number> {
  const db = await getMongoDb(serverArea, userIdentifier);
  if (!db) return Date.now();

  try {
    const counters = db.collection<{ _id: string; seq: number }>("counters");
    const result = await counters.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    return result?.seq ?? Date.now();
  } catch (err) {
    console.warn(`[MongoDB] getNextSequence fallback for area ${serverArea}:`, err);
    return Date.now();
  }
}

/**
 * Creates and stores an order directly into the specific region's MongoDB database.
 * Automatically selects the appropriate server node in that region.
 */
export async function createOrderInMongo(
  data: Omit<OrderSmmDocument, "id" | "create_at" | "update_at"> & {
    id?: number;
    create_at?: Date;
    update_at?: Date;
  },
  serverArea?: string
): Promise<OrderSmmDocument> {
  const resolved = resolveMongoServer(serverArea, data.uuid_user);
  const targetNode = resolved?.nodeId || serverArea || "SG_1";

  const col = await getOrderSmmCollection(serverArea, data.uuid_user);
  if (!col) {
    throw new Error(`Gagal terhubung ke database MongoDB klaster region: ${serverArea || "default"}`);
  }

  const nextId = data.id ?? (await getNextSequence("order_smm", serverArea, data.uuid_user));
  const doc: OrderSmmDocument = {
    id: nextId,
    uuid_user: data.uuid_user,
    uuid_api_provider: data.uuid_api_provider ?? null,
    service_id: String(data.service_id),
    invoice: data.invoice,
    order_id: data.order_id ? String(data.order_id) : null,
    amount: Number(data.amount),
    price_api: Number(data.price_api),
    price_sale: Number(data.price_sale),
    target: data.target,
    remains: data.remains !== undefined ? Number(data.remains) : Number(data.amount),
    start: data.start !== undefined ? Number(data.start) : 0,
    refill: Boolean(data.refill),
    status: data.status || "Pending",
    server_area: targetNode,
    create_at: data.create_at || new Date(),
    update_at: data.update_at || new Date(),
  };

  await col.insertOne(doc as any);
  return doc;
}

/**
 * Fetch orders directly from MongoDB for a specific user.
 * If the user's region has multiple servers (e.g. 10 or 30 servers),
 * it queries in parallel across all active servers in that region and combines them cleanly!
 */
export async function getOrdersFromMongo(
  uuid_user?: string,
  limit: number = 50,
  serverArea?: string
): Promise<OrderSmmDocument[]> {
  try {
    const regionServers = getServersForRegion(serverArea);

    // If only 1 server in region or exact node specified:
    if (regionServers.length <= 1) {
      const col = await getOrderSmmCollection(serverArea, uuid_user);
      if (!col) return [];
      const filter = uuid_user ? { uuid_user } : {};
      const docs = await col.find(filter).sort({ create_at: -1, id: -1 }).limit(limit).toArray();
      return mapOrderDocs(docs, serverArea || "SG");
    }

    // If multiple servers in this region (e.g. SG_1 through SG_30):
    // Query all active servers in that region in parallel so no historical order is missed!
    const queryPromises = regionServers.map(async (srv) => {
      try {
        const client = await getMongoClient(srv.id);
        if (!client) return [];
        const col = client.db("master_smm").collection<OrderSmmDocument>("order_smm");
        const filter = uuid_user ? { uuid_user } : {};
        const docs = await col.find(filter).sort({ create_at: -1, id: -1 }).limit(limit).toArray();
        return mapOrderDocs(docs, srv.id);
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(queryPromises);
    const combined: OrderSmmDocument[] = [];
    const seenInvoices = new Set<string>();

    for (const res of results) {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        for (const item of res.value) {
          if (!seenInvoices.has(item.invoice)) {
            seenInvoices.add(item.invoice);
            combined.push(item);
          }
        }
      }
    }

    // Sort combined by create_at descending and apply limit
    combined.sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime());
    return combined.slice(0, limit);
  } catch (error) {
    console.error(`[MongoDB] Failed to query orders from region ${serverArea}:`, error);
    return [];
  }
}

/**
 * Count total orders across all active servers in the specific region
 */
export async function countOrdersInMongo(
  uuid_user?: string,
  serverArea?: string
): Promise<number> {
  try {
    const regionServers = getServersForRegion(serverArea);

    if (regionServers.length <= 1) {
      const col = await getOrderSmmCollection(serverArea, uuid_user);
      if (!col) return 0;
      const filter = uuid_user ? { uuid_user } : {};
      return await col.countDocuments(filter);
    }

    // Query in parallel across all servers in the region
    const countPromises = regionServers.map(async (srv) => {
      try {
        const client = await getMongoClient(srv.id);
        if (!client) return 0;
        const col = client.db("master_smm").collection<OrderSmmDocument>("order_smm");
        const filter = uuid_user ? { uuid_user } : {};
        return await col.countDocuments(filter);
      } catch {
        return 0;
      }
    });

    const results = await Promise.allSettled(countPromises);
    let totalCount = 0;
    for (const res of results) {
      if (res.status === "fulfilled" && typeof res.value === "number") {
        totalCount += res.value;
      }
    }
    return totalCount;
  } catch (error) {
    console.error(`[MongoDB] Failed to count orders in region ${serverArea}:`, error);
    return 0;
  }
}

function mapOrderDocs(docs: any[], defaultArea: string): OrderSmmDocument[] {
  return docs.map((doc: any) => ({
    id: doc.id,
    uuid_user: doc.uuid_user,
    uuid_api_provider: doc.uuid_api_provider || null,
    service_id: doc.service_id,
    invoice: doc.invoice,
    order_id: doc.order_id || null,
    amount: doc.amount,
    price_api: doc.price_api,
    price_sale: doc.price_sale,
    target: doc.target,
    remains: doc.remains ?? doc.amount,
    start: doc.start ?? 0,
    refill: Boolean(doc.refill),
    status: doc.status || "Pending",
    server_area: doc.server_area || defaultArea,
    create_at: doc.create_at ? new Date(doc.create_at) : new Date(),
    update_at: doc.update_at ? new Date(doc.update_at) : new Date(),
  }));
}

/**
 * Backward compatibility alias
 */
export const saveOrderToMongo = async (
  order: OrderSmmDocument,
  serverArea?: string
): Promise<boolean> => {
  try {
    await createOrderInMongo(order, serverArea);
    return true;
  } catch {
    return false;
  }
};
