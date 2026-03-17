import { useJobStore } from "@/store/jobStore";

export function useJobs() {
  const {
    myJobs,
    activeJob,
    isLoadingJobs,
    activeJobId,
    newlyDeliveredIds,
    fetchMyJobs,
    addJob,
    updateJob,
    setActiveJob,
    setActiveJobId,
    markJobViewed,
    resumeJob,
  } = useJobStore();

  return {
    myJobs,
    activeJob,
    isLoadingJobs,
    activeJobId,
    newlyDeliveredIds,
    fetchMyJobs,
    addJob,
    updateJob,
    setActiveJob,
    setActiveJobId,
    markJobViewed,
    resumeJob,
  };
}
