import { useJobStore } from "@/store/jobStore";

export function useJobs() {
  const { myJobs, activeJob, isLoadingJobs, fetchMyJobs, addJob, updateJob, setActiveJob } =
    useJobStore();

  return { myJobs, activeJob, isLoadingJobs, fetchMyJobs, addJob, updateJob, setActiveJob };
}
