import { NextResponse } from "next/server";
import crypto from "crypto";
import { setNonceCookie } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  const nonce = crypto.randomBytes(16).toString("hex");
  await setNonceCookie(nonce);
  return NextResponse.json({ nonce });
}
