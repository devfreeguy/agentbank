"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { polygon } from "wagmi/chains";
import { isAxiosError } from "axios";
import axiosClient from "@/lib/axiosClient";
import { getAvatarColor } from "@/utils/avatarColor";
import { AgentStatus } from "@/generated/prisma/enums";
import { USDT_CONTRACT_ADDRESS, USDT_DECIMALS } from "@/constants/contracts";
import { USDT_ABI } from "@/constants/usdtAbi";
import { useJobStore } from "@/store/jobStore";
import {
  startJobPoll,
  stopJobPoll,
  setJobCallbacks,
  clearJobCallbacks,
} from "@/lib/backgroundPolls";
import type { AgentPublic, JobWithRelations, WalletUser } from "@/types/index";
import { HireStep1Detail } from "./hire/HireStep1Detail";
import { HireStep2Task } from "./hire/HireStep2Task";
import { HireStep3Pay } from "./hire/HireStep3Pay";
import { HireStep5Running } from "./hire/HireStep5Running";
import { HireStep6Delivered } from "./hire/HireStep6Delivered";

export type HireStep =
  | "detail"
  | "describe"
  | "review"
  | "waiting"
  | "running"
  | "delivered";

interface HireFlowProps {
  agent: AgentPublic;
  user: WalletUser | null;
  step: HireStep;
  onStepChange: (step: HireStep) => void;
  onClose: () => void;
  onJobAdded: (job: JobWithRelations) => void;
  showToast: (msg: string) => void;
}

export function HireFlow({
  agent,
  user,
  step,
  onStepChange,
  onClose,
  onJobAdded,
  showToast,
}: HireFlowProps) {
  const router = useRouter();
  const isActive = agent.status === AgentStatus.ACTIVE;
  const avatarBg = getAvatarColor(agent.id);
  const initial = agent.name.charAt(0).toUpperCase();

  const [taskDescription, setTaskDescription] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<JobWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addJob, setActiveJobId: setGlobalActiveJobId } = useJobStore.getState();

  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isOnPolygon = chainId === polygon.id;

  const {
    writeContract,
    data: writeTxHash,
    isPending: isWalletPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ hash: writeTxHash, chainId: polygon.id });

  const hasRunRef = useRef(false);
  const prevJobIdRef = useRef<string | null>(null);

  // Reset local state when returning to detail
  useEffect(() => {
    if (step === "detail") {
      // Stop any background poll for the previous job (user abandoned)
      if (prevJobIdRef.current) {
        stopJobPoll(prevJobIdRef.current);
        prevJobIdRef.current = null;
      }
      setTaskDescription("");
      setActiveJobId(null);
      setActiveJob(null);
      setError(null);
      setIsSubmitting(false);
      resetWrite();
      hasRunRef.current = false;
    }
  }, [step]);

  // Create job after on-chain receipt confirmed
  useEffect(() => {
    if (!isReceiptSuccess || !writeTxHash || !user || activeJobId || isSubmitting) return;

    async function createAndConfirm() {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await axiosClient.post<{ data: { id: string } }>("/api/jobs", {
          clientId: user!.id,
          agentId: agent.id,
          taskDescription,
        });
        const jobId = res.data.data.id;
        setActiveJobId(jobId);
        prevJobIdRef.current = jobId;
        setGlobalActiveJobId(jobId);

        // Confirm payment
        await axiosClient.post(`/api/jobs/${jobId}/check-payment`, { txHash: writeTxHash });

        // Immediately add a partial job to the store so it appears in the dashboard
        const partialJob: JobWithRelations = {
          id: jobId,
          clientId: user!.id,
          agentId: agent.id,
          taskDescription,
          priceUsdt: agent.pricePerTask,
          status: "PAID" as const,
          output: null,
          txHash: writeTxHash ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          agent,
          client: { id: user!.id, walletAddress: user!.walletAddress ?? "" },
        };
        addJob(partialJob);
        onJobAdded(partialJob);

        onStepChange("running");
      } catch (err) {
        const msg =
          isAxiosError(err) && err.response?.data?.error
            ? (err.response.data.error as string)
            : "Failed to create job. Please try again.";
        setError(msg);
      } finally {
        setIsSubmitting(false);
      }
    }

    createAndConfirm();
  }, [isReceiptSuccess, writeTxHash]);

  // Start background polling when entering "running" step
  useEffect(() => {
    if (step !== "running" || !activeJobId) return;

    // Trigger agent execution exactly once per job
    if (!hasRunRef.current) {
      hasRunRef.current = true;
      axiosClient.post(`/api/jobs/${activeJobId}/run`).catch((err) =>
        console.error("[HireFlow] /run failed:", err)
      );
    }

    startJobPoll(activeJobId);
    setJobCallbacks(activeJobId, {
      onDelivered: (job) => {
        setActiveJob(job);
        onStepChange("delivered");
      },
      onFailed: (job) => {
        setActiveJob(job);
        setError("The agent failed to complete the task.");
      },
    });

    return () => {
      // Sheet closing — clear callbacks so background poll shows toast instead
      if (activeJobId) clearJobCallbacks(activeJobId);
    };
  }, [step, activeJobId]);

  function handlePayWithWallet() {
    if (!user) {
      router.push("/connect");
      return;
    }
    resetWrite();
    setError(null);
    const amountInWei = BigInt(
      Math.round(parseFloat(agent.pricePerTask) * 10 ** USDT_DECIMALS)
    );
    writeContract({
      address: USDT_CONTRACT_ADDRESS as `0x${string}`,
      abi: USDT_ABI,
      functionName: "transfer",
      args: [agent.walletAddress as `0x${string}`, amountInWei],
      chainId: polygon.id,
    });
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard"));
  }

  const isMining = !!writeTxHash && isReceiptLoading;
  const isConfirming = isReceiptSuccess && isSubmitting;
  const isBusy = isWalletPending || isMining || isConfirming;

  const payError =
    writeError
      ? writeError.message.includes("User rejected") || writeError.message.includes("user rejected")
        ? "Transaction rejected. Please try again."
        : writeError.message
      : isReceiptError
      ? "Transaction failed on-chain. Please try again."
      : error;

  const shortTxHash = writeTxHash
    ? writeTxHash.slice(0, 10) + "…" + writeTxHash.slice(-8)
    : "";

  if (step === "detail") {
    return (
      <HireStep1Detail
        agent={agent}
        isActive={isActive}
        avatarBg={avatarBg}
        initial={initial}
        onHire={() => onStepChange("describe")}
        copyText={copyText}
      />
    );
  }

  if (step === "describe") {
    return (
      <HireStep2Task
        agent={agent}
        taskDescription={taskDescription}
        onTaskChange={setTaskDescription}
        onBack={() => onStepChange("detail")}
        onContinue={() => onStepChange("review")}
      />
    );
  }

  if (step === "review") {
    return (
      <HireStep3Pay
        agent={agent}
        taskDescription={taskDescription}
        isWalletPending={isWalletPending}
        isMining={isMining}
        isConfirming={isConfirming}
        isBusy={isBusy}
        isOnPolygon={isOnPolygon}
        isSwitching={isSwitching}
        writeTxHash={writeTxHash}
        payError={payError}
        shortTxHash={shortTxHash}
        onBack={() => {
          resetWrite();
          setError(null);
          onStepChange("describe");
        }}
        onPay={handlePayWithWallet}
        onSwitchChain={() => switchChain({ chainId: polygon.id })}
      />
    );
  }

  if (step === "running") {
    return <HireStep5Running agent={agent} />;
  }

  if (step === "delivered" && activeJob) {
    return (
      <HireStep6Delivered
        agent={agent}
        avatarBg={avatarBg}
        initial={initial}
        activeJob={activeJob}
        copyText={copyText}
        onHireAgain={() => {
          setTaskDescription("");
          onStepChange("describe");
        }}
        onDashboard={() => router.push("/dashboard")}
      />
    );
  }

  if (step === "delivered") {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-[13px]">
        Loading result…
      </div>
    );
  }

  return null;
}
