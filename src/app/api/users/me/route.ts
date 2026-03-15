import { NextRequest, NextResponse } from "next/server";
import { getUserByWallet, updateUserRole } from "@/lib/db/users";
import { connectSchema, updateRoleSchema } from "@/lib/validations/userSchema";
import { Role } from "@/generated/prisma/enums";
import type { ApiError, ApiSuccess, WalletUser } from "@/types/index";

export async function GET(req: NextRequest): Promise<NextResponse<ApiSuccess<WalletUser> | ApiError>> {
  const walletAddress = req.nextUrl.searchParams.get("walletAddress");
  console.log("[GET /api/users/me] walletAddress received:", walletAddress);

  const parsed = connectSchema.safeParse({ walletAddress });
  if (!parsed.success) {
    console.log("[GET /api/users/me] validation failed:", parsed.error.issues[0]?.message);
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Invalid walletAddress" },
      { status: 400 }
    );
  }

  try {
    const user = await getUserByWallet(parsed.data.walletAddress);
    if (!user) {
      console.log("[GET /api/users/me] user not found for:", parsed.data.walletAddress);
      return NextResponse.json<ApiError>({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json<ApiSuccess<WalletUser>>({ data: user });
  } catch (error) {
    console.error("[GET /api/users/me] error:", error);
    return NextResponse.json<ApiError>(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiSuccess<WalletUser> | ApiError>> {
  const walletAddress = req.nextUrl.searchParams.get("walletAddress");

  const addressParsed = connectSchema.safeParse({ walletAddress });
  if (!addressParsed.success) {
    return NextResponse.json<ApiError>(
      { error: addressParsed.error.issues[0]?.message ?? "Invalid walletAddress" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roleParsed = updateRoleSchema.safeParse(body);
  if (!roleParsed.success) {
    return NextResponse.json<ApiError>(
      { error: roleParsed.error.issues[0]?.message ?? "Invalid role" },
      { status: 400 }
    );
  }

  try {
    const existingUser = await getUserByWallet(addressParsed.data.walletAddress);
    if (!existingUser) {
      return NextResponse.json<ApiError>({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await updateUserRole(existingUser.id, roleParsed.data.role as Role);
    return NextResponse.json<ApiSuccess<WalletUser>>({ data: updatedUser });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
