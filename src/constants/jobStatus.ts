import { JobStatus } from "@/generated/prisma/enums";

export const JobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.PENDING_PAYMENT]: "Pending Payment",
  [JobStatus.PAID]: "Paid",
  [JobStatus.IN_PROGRESS]: "In Progress",
  [JobStatus.DELIVERED]: "Delivered",
  [JobStatus.FAILED]: "Failed",
};

export const JobStatusColors: Record<JobStatus, string> = {
  [JobStatus.PENDING_PAYMENT]: "bg-yellow-100 text-yellow-800",
  [JobStatus.PAID]: "bg-blue-100 text-blue-800",
  [JobStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800",
  [JobStatus.DELIVERED]: "bg-green-100 text-green-800",
  [JobStatus.FAILED]: "bg-red-100 text-red-800",
};
