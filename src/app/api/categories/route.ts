import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/db/categories";
import type { ApiError, ApiSuccess, CategoryWithSubs } from "@/types/index";

export async function GET(): Promise<NextResponse<ApiSuccess<CategoryWithSubs[]> | ApiError>> {
  try {
    const categories = await getAllCategories();
    return NextResponse.json<ApiSuccess<CategoryWithSubs[]>>({ data: categories });
  } catch (error) {
    console.error("categories error:", error);
    return NextResponse.json<ApiError>(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
