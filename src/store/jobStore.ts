import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import axios from "axios";
import type { JobWithRelations } from "@/types/index";

interface JobState {
  myJobs: JobWithRelations[];
  myJobsWallet: string | null;
  activeJob: JobWithRelations | null;
  isLoadingJobs: boolean;
}

interface JobActions {
  setMyJobs: (jobs: JobWithRelations[]) => void;
  setActiveJob: (job: JobWithRelations | null) => void;
  addJob: (job: JobWithRelations) => void;
  updateJob: (id: string, updates: Partial<JobWithRelations>) => void;
  fetchMyJobs: (walletAddress: string, force?: boolean) => Promise<void>;
}

export const useJobStore = create<JobState & JobActions>()(
  immer((set, get) => ({
    myJobs: [],
    myJobsWallet: null,
    activeJob: null,
    isLoadingJobs: false,

    setMyJobs: (jobs) =>
      set((state) => {
        state.myJobs = jobs;
      }),

    setActiveJob: (job) =>
      set((state) => {
        state.activeJob = job;
      }),

    addJob: (job) =>
      set((state) => {
        state.myJobs.unshift(job);
      }),

    updateJob: (id, updates) =>
      set((state) => {
        const idx = state.myJobs.findIndex((j) => j.id === id);
        if (idx !== -1) Object.assign(state.myJobs[idx], updates);
      }),

    fetchMyJobs: async (walletAddress, force = false) => {
      const { myJobsWallet, myJobs } = get();
      if (!force && myJobsWallet === walletAddress && myJobs.length > 0) return;

      set((state) => {
        state.isLoadingJobs = true;
      });
      try {
        const res = await axios.get<{ data: JobWithRelations[] }>(
          `/api/jobs?walletAddress=${walletAddress}`
        );
        set((state) => {
          state.myJobs = res.data.data;
          state.myJobsWallet = walletAddress;
        });
      } catch (err) {
        console.error("[jobStore] fetchMyJobs failed:", err);
      } finally {
        set((state) => {
          state.isLoadingJobs = false;
        });
      }
    },
  }))
);
