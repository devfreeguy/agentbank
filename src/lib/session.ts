import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "ab_auth_session";
const NONCE_COOKIE_NAME = "ab_auth_nonce";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

// ─── JWT Session ────────────────────────────────────────────────────────────

export async function setSessionCookie(walletAddress: string) {
  const token = await new SignJWT({ walletAddress })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getCurrentSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    return (payload.walletAddress as string) ?? null;
  } catch {
    // Token expired or tampered with
    return null;
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ─── Nonce (SIWE) ────────────────────────────────────────────────────────────

export async function setNonceCookie(nonce: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: NONCE_COOKIE_NAME,
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5, // 5-minute challenge window
  });
}

export async function consumeNonce(): Promise<string | null> {
  const cookieStore = await cookies();
  const nonce = cookieStore.get(NONCE_COOKIE_NAME)?.value ?? null;
  if (nonce) cookieStore.delete(NONCE_COOKIE_NAME); // one-time use
  return nonce;
}
