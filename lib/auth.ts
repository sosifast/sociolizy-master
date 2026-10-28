export interface UserSession {
  id: number;
  uuid: string;
  username: string;
  email?: string;
  level: "Admin" | "Member";
  server_area?: string;
  iat?: number;
}

const SESSION_SECRET = process.env.SESSION_SECRET || "master_smm_secure_session_secret_2026_xyz";

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64url, "base64url").toString("utf-8");
  }
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Creates a cryptographically signed HMAC SHA-256 session token
 * (Compatible with Edge runtime and standard Node.js)
 */
export async function createSessionToken(session: UserSession): Promise<string> {
  const data = {
    ...session,
    iat: Date.now(),
  };
  const jsonStr = JSON.stringify(data);
  const base64Data = toBase64Url(jsonStr);
  const signature = await hmacSha256(SESSION_SECRET, base64Data);

  return `${base64Data}.${signature}`;
}

/**
 * Verifies and parses a session token (supports HMAC signed token and legacy JSON fallback)
 * (Compatible with Edge runtime and standard Node.js)
 */
export async function verifySessionToken(token: string | undefined | null): Promise<UserSession | null> {
  if (!token) return null;

  try {
    // 1. Check signed token: <base64url>.<signatureHex>
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length === 2) {
        const [base64Data, signature] = parts;
        const expectedSignature = await hmacSha256(SESSION_SECRET, base64Data);

        if (signature !== expectedSignature) {
          return null;
        }

        const jsonStr = fromBase64Url(base64Data);
        return JSON.parse(jsonStr) as UserSession;
      }
    }

    // 2. Backward compatibility fallback for raw JSON cookies during development
    if (token.startsWith("{") && token.endsWith("}")) {
      const parsed = JSON.parse(token);
      if (parsed && (parsed.id || parsed.username) && parsed.level) {
        return parsed as UserSession;
      }
    }
  } catch {
    return null;
  }

  return null;
}
