import { prisma } from "@/lib/prisma";
import type { CategoryWithSubs } from "@/types/index";

export async function getAllCategories(): Promise<CategoryWithSubs[]> {
  try {
    return await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            categoryId: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    throw new Error(
      `getAllCategories failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
