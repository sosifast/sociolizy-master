export interface UserSession {
  id: number;
  uuid: string;
  username: string;
  email?: string;
  level: "Admin" | "Member";
  server_area?: string;
  iat?: number;
  exp?: number;
  mobile_session_version?: number;
}

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 bytes");
  }
  return secret;
}

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

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyHmacSha256(secret: string, data: string, signatureHex: string): Promise<boolean> {
  if (!/^[\da-f]{64}$/i.test(signatureHex)) return false;
  const signature = new Uint8Array(
    signatureHex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16))
  );
  return crypto.subtle.verify(
    "HMAC",
    await getHmacKey(secret),
    signature,
    new TextEncoder().encode(data)
  );
}

/**
 * Creates a cryptographically signed HMAC SHA-256 session token
 * (Compatible with Edge runtime and standard Node.js)
 */
export async function createSessionToken(session: UserSession): Promise<string> {
  const now = Date.now();
  const data = {
    ...session,
    iat: now,
    exp: now + SESSION_TTL_SECONDS * 1000,
    jti: crypto.randomUUID(),
  };
  const jsonStr = JSON.stringify(data);
  const base64Data = toBase64Url(jsonStr);
  const signature = await hmacSha256(getSessionSecret(), base64Data);

  return `${base64Data}.${signature}`;
}

/**
 * Verifies and parses an HMAC-signed, expiring session token.
 * (Compatible with Edge runtime and standard Node.js)
 */
export async function verifySessionToken(token: string | undefined | null): Promise<UserSession | null> {
  if (!token || token.length > 4096) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    if (!(await verifyHmacSha256(getSessionSecret(), base64Data, signature))) return null;

    const session = JSON.parse(fromBase64Url(base64Data)) as UserSession;
    const now = Date.now();
    const issuedAt = session?.iat;
    const expiresAt = session?.exp;

    if (
      !session ||
      !Number.isSafeInteger(session.id) ||
      session.id <= 0 ||
      typeof session.uuid !== "string" ||
      !session.uuid ||
      typeof session.username !== "string" ||
      (session.level !== "Admin" && session.level !== "Member") ||
      typeof issuedAt !== "number" ||
      typeof expiresAt !== "number" ||
      !Number.isFinite(issuedAt) ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= issuedAt ||
      expiresAt <= now ||
      issuedAt > now + 60_000 ||
      expiresAt - issuedAt > SESSION_TTL_SECONDS * 1000
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
