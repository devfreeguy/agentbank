import { useEffect } from "react";
import { useCategoryStore } from "@/store/categoryStore";

export function useCategories() {
  const { categories, isLoading, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, fetchCategories };
}
