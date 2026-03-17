import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import axiosClient from "@/lib/axiosClient";
import type { CategoryWithSubs } from "@/types/index";

interface CategoryState {
  categories: CategoryWithSubs[];
  isLoading: boolean;
}

interface CategoryActions {
  setCategories: (categories: CategoryWithSubs[]) => void;
  fetchCategories: (force?: boolean) => Promise<void>;
}

export const useCategoryStore = create<CategoryState & CategoryActions>()(
  immer((set, get) => ({
    categories: [],
    isLoading: false,

    setCategories: (categories) =>
      set((state) => {
        state.categories = categories;
      }),

    fetchCategories: async (force = false) => {
      const { categories } = get();
      if (!force && categories.length > 0) return;

      set((state) => {
        state.isLoading = true;
      });
      try {
        const res = await axiosClient.get<{ data: CategoryWithSubs[] }>("/api/categories");
        if (res.data?.data) {
          set((state) => {
            state.categories = res.data.data;
          });
        }
      } catch (err) {
        console.error("[categoryStore] fetchCategories failed:", err);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
  }))
);
