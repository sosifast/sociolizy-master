import { Collection, ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";

// ─────────────────────────────────────────────
// Ticket document schema
// ─────────────────────────────────────────────
export interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  sender_name: string;
  content: string;
  created_at: Date;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketCategory = "general" | "billing" | "technical" | "order";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface TicketDocument {
  _id?: ObjectId;
  ticket_id: string;
  user_uuid: string;
  username: string;
  email: string;
  server_area: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function getTicketCollection(
  serverArea?: string,
  userUuid?: string
): Promise<Collection<TicketDocument> | null> {
  const db = await getMongoDb(serverArea, userUuid);
  if (!db) return null;
  const col = db.collection<TicketDocument>("tickets");
  // Ensure indexes (fire-and-forget)
  col.createIndex({ ticket_id: 1 }, { unique: true, background: true }).catch(() => {});
  col.createIndex({ user_uuid: 1, created_at: -1 }, { background: true }).catch(() => {});
  col.createIndex({ status: 1, created_at: -1 }, { background: true }).catch(() => {});
  return col;
}

function generateTicketId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TKT-${datePart}-${rand}`;
}

// ─────────────────────────────────────────────
// CRUD operations
// ─────────────────────────────────────────────

/** Create a new ticket */
export async function createTicket(
  data: Pick<TicketDocument, "user_uuid" | "username" | "email" | "server_area" | "subject" | "category" | "priority"> & {
    first_message: string;
  }
): Promise<TicketDocument> {
  const col = await getTicketCollection(data.server_area, data.user_uuid);
  if (!col) throw new Error("Failed to connect to ticket database");

  const now = new Date();
  const ticket: TicketDocument = {
    ticket_id: generateTicketId(),
    user_uuid: data.user_uuid,
    username: data.username,
    email: data.email,
    server_area: data.server_area,
    subject: data.subject,
    category: data.category,
    status: "open",
    priority: data.priority,
    messages: [
      {
        id: crypto.randomUUID(),
        sender: "user",
        sender_name: data.username,
        content: data.first_message,
        created_at: now,
      },
    ],
    created_at: now,
    updated_at: now,
  };

  await col.insertOne(ticket as any);
  return ticket;
}

/** Get tickets for a specific user */
export async function getTicketsByUser(
  userUuid: string,
  serverArea: string,
  limit = 50
): Promise<TicketDocument[]> {
  const col = await getTicketCollection(serverArea, userUuid);
  if (!col) return [];
  return col
    .find({ user_uuid: userUuid })
    .sort({ updated_at: -1 })
    .limit(limit)
    .toArray();
}

/** Get a single ticket by ticket_id */
export async function getTicketById(
  ticketId: string,
  serverArea?: string,
  userUuid?: string
): Promise<TicketDocument | null> {
  const col = await getTicketCollection(serverArea, userUuid);
  if (!col) return null;
  return col.findOne({ ticket_id: ticketId });
}

export interface AdminTicketQuery {
  status?: TicketStatus | "all";
  category?: TicketCategory | "all";
  priority?: TicketPriority | "all";
  search?: string;
  page?: number;
  limit?: number;
}

/** Get ALL tickets across ALL MongoDB servers (admin view) */
export async function getAllTicketsAdmin(
  opts: AdminTicketQuery = {}
): Promise<{ tickets: TicketDocument[]; total: number }> {
  const { getMongoClientByNode } = await import("@/lib/mongodb");
  const { getDiscoveredServers } = await import("@/lib/server-db");

  const { status = "all", category = "all", priority = "all", search = "", page = 1, limit = 20 } = opts;

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (category && category !== "all") filter.category = category;
  if (priority && priority !== "all") filter.priority = priority;
  if (search.trim()) {
    filter.$or = [
      { ticket_id: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const allServers = getDiscoveredServers().filter((s: { isConfigured: boolean }) => s.isConfigured);
  const allTickets: TicketDocument[] = [];
  const seenIds = new Set<string>();

  await Promise.allSettled(
    allServers.map(async (srv: { id: string }) => {
      try {
        const client = await getMongoClientByNode(srv as any);
        if (!client) return;
        const col = client.db("master_smm").collection<TicketDocument>("tickets");
        const docs = await col.find(filter).sort({ updated_at: -1 }).limit(300).toArray();
        for (const d of docs) {
          if (!seenIds.has(d.ticket_id)) {
            seenIds.add(d.ticket_id);
            allTickets.push(d);
          }
        }
      } catch {
        // skip unreachable server
      }
    })
  );

  allTickets.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const total = allTickets.length;
  const skip = (Math.max(1, page) - 1) * limit;
  return { tickets: allTickets.slice(skip, skip + limit), total };
}

/** Add a message to a ticket */
export async function addTicketMessage(
  ticketId: string,
  msg: Omit<TicketMessage, "id" | "created_at">,
  serverArea?: string,
  userUuid?: string
): Promise<TicketMessage | null> {
  const col = await getTicketCollection(serverArea, userUuid);
  if (!col) return null;

  const newMsg: TicketMessage = {
    id: crypto.randomUUID(),
    ...msg,
    created_at: new Date(),
  };

  const result = await col.updateOne(
    { ticket_id: ticketId },
    {
      $push: { messages: newMsg as any },
      $set: { updated_at: new Date() },
    }
  );

  return result.modifiedCount > 0 ? newMsg : null;
}

/** Update ticket status */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  serverArea?: string,
  userUuid?: string
): Promise<boolean> {
  const col = await getTicketCollection(serverArea, userUuid);
  if (!col) return false;

  const setPayload: Record<string, unknown> = { status, updated_at: new Date() };
  if (status === "resolved") setPayload.resolved_at = new Date();

  const result = await col.updateOne({ ticket_id: ticketId }, { $set: setPayload });
  return result.modifiedCount > 0;
}

/** Update ticket priority */
export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
  serverArea?: string,
  userUuid?: string
): Promise<boolean> {
  const col = await getTicketCollection(serverArea, userUuid);
  if (!col) return false;
  const result = await col.updateOne(
    { ticket_id: ticketId },
    { $set: { priority, updated_at: new Date() } }
  );
  return result.modifiedCount > 0;
}

