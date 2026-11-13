import { Collection, Filter, Db } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";

export type TraceType = "user" | "smm" | "merchant" | "mobile";
export type TraceStatus = "SUCCESS" | "FAILED" | "WARNING";

export interface TraceLogDocument {
  _id?: any;
  type: TraceType;
  action: string;
  status: TraceStatus;
  status_code?: number;
  user_id?: string | number | null;
  username?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  endpoint: string;
  method: string;
  request_payload?: any;
  response_payload?: any;
  latency_ms?: number;
  error_message?: string | null;
  metadata?: Record<string, any>;
  create_at: Date;
}

export interface TraceLogQueryOptions {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "pass",
  "pin",
  "token",
  "accesstoken",
  "refreshtoken",
  "sessiontoken",
  "secret",
  "secretkey",
  "apikey",
  "api_key",
  "key",
  "authorization",
  "cookie",
  "credential",
  "privatekey",
]);

/**
 * Sanitizes arbitrary data by masking sensitive fields (passwords, tokens, keys)
 */
export function sanitizePayload(data: any, depth = 0): any {
  if (depth > 5) return "[Deep Object]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    if (data.length > 5000) {
      return data.slice(0, 5000) + "... [truncated]";
    }
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    if (data.length > 50) {
      const slice = data.slice(0, 50).map((item) => sanitizePayload(item, depth + 1));
      slice.push(`... [${data.length - 50} more items]`);
      return slice;
    }
    return data.map((item) => sanitizePayload(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      if (typeof value === "string" && value.length > 8) {
        sanitized[key] = `${value.slice(0, 4)}***${value.slice(-3)}`;
      } else {
        sanitized[key] = "******";
      }
    } else {
      sanitized[key] = sanitizePayload(value, depth + 1);
    }
  }

  return sanitized;
}

/**
 * Extracts real client IP address from standard and reverse proxy headers
 */
export function extractClientIp(req: Request | Headers): string {
  const headers = req instanceof Request ? req.headers : req;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-client-ip") ||
    "127.0.0.1"
  );
}

let indexesInitialized = false;

/**
 * Gets MongoDB collection for trace logs and guarantees the 7-day TTL rotation index
 */
export async function getTraceLogCollection(): Promise<Collection<TraceLogDocument> | null> {
  try {
    const db = await getMongoDb();
    if (!db) return null;

    const collection = db.collection<TraceLogDocument>("system_trace_logs");

    if (!indexesInitialized) {
      indexesInitialized = true;
      // 7-day automatic rotation via MongoDB TTL index (7 * 24 * 60 * 60 = 604,800 seconds)
      collection
        .createIndex(
          { create_at: 1 },
          { expireAfterSeconds: 604800, background: true, name: "trace_logs_ttl_7d" }
        )
        .catch((err) => {
          // If TTL index exists with different option, ignore error or recreate
          if (err?.code !== 85) {
            console.warn("[TraceLogger] Warning ensuring TTL index:", err?.message);
          }
        });

      // Performance indexing for filtering & fast admin pagination
      collection.createIndex({ type: 1, create_at: -1 }, { background: true }).catch(() => {});
      collection.createIndex({ status: 1, create_at: -1 }, { background: true }).catch(() => {});
      collection.createIndex({ action: 1, create_at: -1 }, { background: true }).catch(() => {});
      collection.createIndex({ username: 1, create_at: -1 }, { background: true }).catch(() => {});
      collection.createIndex({ ip: 1, create_at: -1 }, { background: true }).catch(() => {});
    }

    return collection;
  } catch (error) {
    console.warn("[TraceLogger] Failed to access collection:", error);
    return null;
  }
}

/**
 * Non-blocking trace recorder
 */
export async function recordTrace(
  trace: Omit<TraceLogDocument, "create_at"> & { create_at?: Date }
): Promise<void> {
  // Execute asynchronously so caller is never delayed or blocked
  (async () => {
    try {
      const collection = await getTraceLogCollection();
      if (!collection) return;

      const doc: TraceLogDocument = {
        ...trace,
        request_payload: trace.request_payload ? sanitizePayload(trace.request_payload) : null,
        response_payload: trace.response_payload ? sanitizePayload(trace.response_payload) : null,
        create_at: trace.create_at || new Date(),
      };

      await collection.insertOne(doc);
    } catch (err: any) {
      console.warn(`[TraceLogger] Error recording ${trace.type} trace:`, err?.message || err);
    }
  })().catch(() => {});
}

/**
 * Convenience logger for User actions (Login, Logout, Register, Profile, etc.)
 */
export function traceUserActivity(params: {
  action: string;
  status: TraceStatus;
  user_id?: string | number | null;
  username?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  endpoint: string;
  method?: string;
  status_code?: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string | null;
  latency_ms?: number;
  metadata?: Record<string, any>;
}) {
  return recordTrace({
    type: "user",
    action: params.action,
    status: params.status,
    status_code: params.status_code || (params.status === "SUCCESS" ? 200 : 400),
    user_id: params.user_id,
    username: params.username,
    ip: params.ip,
    user_agent: params.user_agent,
    endpoint: params.endpoint,
    method: params.method || "POST",
    request_payload: params.request_payload,
    response_payload: params.response_payload,
    error_message: params.error_message,
    latency_ms: params.latency_ms,
    metadata: params.metadata,
  });
}

/**
 * Convenience logger for SMM API (/api/v1 - add, status, services, balance, etc.)
 */
export function traceSmmApi(params: {
  action: string;
  status: TraceStatus;
  user_id?: string | number | null;
  username?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  endpoint?: string;
  method?: string;
  status_code?: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string | null;
  latency_ms?: number;
  metadata?: Record<string, any>;
}) {
  return recordTrace({
    type: "smm",
    action: params.action,
    status: params.status,
    status_code: params.status_code || (params.status === "SUCCESS" ? 200 : 400),
    user_id: params.user_id,
    username: params.username,
    ip: params.ip,
    user_agent: params.user_agent,
    endpoint: params.endpoint || "/api/v1",
    method: params.method || "POST",
    request_payload: params.request_payload,
    response_payload: params.response_payload,
    error_message: params.error_message,
    latency_ms: params.latency_ms,
    metadata: params.metadata,
  });
}

/**
 * Convenience logger for Merchant API & Gateway
 */
export function traceMerchantApi(params: {
  action: string;
  status: TraceStatus;
  user_id?: string | number | null;
  username?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  endpoint: string;
  method?: string;
  status_code?: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string | null;
  latency_ms?: number;
  metadata?: Record<string, any>;
}) {
  return recordTrace({
    type: "merchant",
    action: params.action,
    status: params.status,
    status_code: params.status_code || (params.status === "SUCCESS" ? 200 : 400),
    user_id: params.user_id,
    username: params.username,
    ip: params.ip,
    user_agent: params.user_agent,
    endpoint: params.endpoint,
    method: params.method || "POST",
    request_payload: params.request_payload,
    response_payload: params.response_payload,
    error_message: params.error_message,
    latency_ms: params.latency_ms,
    metadata: params.metadata,
  });
}

/**
 * Convenience logger for Mobile API (/api/mobile/v1/...)
 */
export function traceMobileApi(params: {
  action: string;
  status: TraceStatus;
  user_id?: string | number | null;
  username?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  endpoint: string;
  method?: string;
  status_code?: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string | null;
  latency_ms?: number;
  metadata?: Record<string, any>;
}) {
  return recordTrace({
    type: "mobile",
    action: params.action,
    status: params.status,
    status_code: params.status_code || (params.status === "SUCCESS" ? 200 : 400),
    user_id: params.user_id,
    username: params.username,
    ip: params.ip,
    user_agent: params.user_agent,
    endpoint: params.endpoint,
    method: params.method || "POST",
    request_payload: params.request_payload,
    response_payload: params.response_payload,
    error_message: params.error_message,
    latency_ms: params.latency_ms,
    metadata: params.metadata,
  });
}

/**
 * Query trace logs for Admin Viewer
 */
export async function getTraceLogs(options: TraceLogQueryOptions = {}) {
  const collection = await getTraceLogCollection();
  if (!collection) {
    return { logs: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const {
    type,
    status,
    search,
    page = 1,
    limit = 20,
    startDate,
    endDate,
  } = options;

  const query: Filter<TraceLogDocument> = {};

  if (type && type !== "all" && ["user", "smm", "merchant", "mobile"].includes(type)) {
    query.type = type as TraceType;
  }

  if (status && status !== "ALL" && ["SUCCESS", "FAILED", "WARNING"].includes(status)) {
    query.status = status as TraceStatus;
  }

  if (startDate || endDate) {
    query.create_at = {};
    if (startDate) {
      query.create_at.$gte = new Date(startDate);
    }
    if (endDate) {
      query.create_at.$lte = new Date(endDate);
    }
  }

  if (search && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    query.$or = [
      { username: regex },
      { ip: regex },
      { endpoint: regex },
      { action: regex },
      { error_message: regex },
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [logs, total] = await Promise.all([
    collection
      .find(query)
      .sort({ create_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  return {
    logs: logs.map((log) => ({
      ...log,
      _id: log._id ? String(log._id) : undefined,
    })),
    total,
    page: Math.max(1, page),
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Aggregates statistics for the Admin Trace Dashboard (within the 7-day TTL rotation window)
 */
export async function getTraceLogStats() {
  const collection = await getTraceLogCollection();
  if (!collection) {
    return {
      total: 0,
      userCount: 0,
      smmCount: 0,
      merchantCount: 0,
      mobileCount: 0,
      failedCount: 0,
      successCount: 0,
    };
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const matchFilter = { create_at: { $gte: sevenDaysAgo } };

  try {
    const [countsByType, countsByStatus, total] = await Promise.all([
      collection
        .aggregate([
          { $match: matchFilter },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: matchFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray(),
      collection.countDocuments(matchFilter),
    ]);

    const typeMap = new Map<string, number>();
    countsByType.forEach((item: any) => typeMap.set(item._id, item.count));

    const statusMap = new Map<string, number>();
    countsByStatus.forEach((item: any) => statusMap.set(item._id, item.count));

    return {
      total,
      userCount: typeMap.get("user") || 0,
      smmCount: typeMap.get("smm") || 0,
      merchantCount: typeMap.get("merchant") || 0,
      mobileCount: typeMap.get("mobile") || 0,
      failedCount: statusMap.get("FAILED") || 0,
      successCount: statusMap.get("SUCCESS") || 0,
    };
  } catch (error) {
    console.warn("[TraceLogger] Stats aggregation failed:", error);
    return {
      total: 0,
      userCount: 0,
      smmCount: 0,
      merchantCount: 0,
      mobileCount: 0,
      failedCount: 0,
      successCount: 0,
    };
  }
}

