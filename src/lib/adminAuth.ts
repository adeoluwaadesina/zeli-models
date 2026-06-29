// Admin session: an HMAC-signed, expiring token stored in the admin cookie.
//
// Before this change the cookie value was the literal "1", so anyone could set
// `document.cookie = "zeli_admin=1"` and gain full admin. The value is now a
// signed token (payload.signature) that only the server can mint, verified on
// every admin request. Crypto uses the Web Crypto API (globalThis.crypto.subtle)
// so the SAME code runs in the Edge middleware AND the Node API routes.
//
// REQUIRED ENV: ADMIN_SESSION_SECRET (a long random string). Set it in the host
// env (Vercel). If it is missing, verification fails closed (no admin access)
// and minting throws, by design.

export const ADMIN_COOKIE = "zeli_admin";

// Session lifetime in seconds (12h), matching the previous cookie maxAge.
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

const enc = new TextEncoder();
const dec = new TextDecoder();

function bytesToB64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(str: string): Uint8Array<ArrayBuffer> {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Mint a fresh signed admin session token. Throws if ADMIN_SESSION_SECRET is unset. */
export async function createAdminSession(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = bytesToB64Url(enc.encode(JSON.stringify({ exp })));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${bytesToB64Url(sig)}`;
}

/**
 * Verify an admin session token. Returns true only if the signature is valid
 * (minted by this server) AND the token has not expired. Fails closed on any
 * malformed input or missing secret.
 */
export async function verifyAdminSession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  if (!process.env.ADMIN_SESSION_SECRET) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;

  let key: CryptoKey;
  try {
    key = await getKey();
  } catch {
    return false;
  }

  let valid = false;
  try {
    valid = await crypto.subtle.verify("HMAC", key, b64UrlToBytes(sig), enc.encode(payload));
  } catch {
    return false;
  }
  if (!valid) return false;

  try {
    const data = JSON.parse(dec.decode(b64UrlToBytes(payload))) as { exp?: unknown };
    if (typeof data.exp !== "number") return false;
    if (data.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}
