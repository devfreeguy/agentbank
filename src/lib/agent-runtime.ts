import { getJobById, updateJobStatus } from "@/lib/db/jobs";
import { getAgentWithSeed, getActiveAgents, incrementJobsCompleted } from "@/lib/db/agents";
import { createSubJob, updateSubJobStatus, updateSubJobOutput } from "@/lib/db/subJobs";
import { runAgentTask } from "@/lib/groq";
import { sendUsdt, getAgentBalance } from "@/lib/wdk";
import { prisma } from "@/lib/prisma";
import { JobStatus, SubJobStatus, TransactionType } from "@/generated/prisma/enums";

const USDT_PER_TOKEN = 0.00001;

function calcCost(totalTokens: number): string {
  return (totalTokens * USDT_PER_TOKEN).toFixed(6);
}

async function recordSpent(
  agentId: string,
  costUsdt: string,
  description: string
): Promise<void> {
  await prisma.$transaction([
    prisma.agentTransaction.create({
      data: { agentId, type: TransactionType.SPENT, amountUsdt: costUsdt, description },
    }),
    prisma.agent.update({
      where: { id: agentId },
      data: { totalSpent: { increment: costUsdt } },
    }),
  ]);
}

function cleanOutput(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const text =
      typeof parsed.response === "string" ? parsed.response :
      typeof parsed.content === "string" ? parsed.content :
      typeof parsed.text === "string" ? parsed.text :
      typeof parsed.result === "string" ? parsed.result :
      null;
    if (text !== null) return text;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

type DelegateDecision =
  | { delegate: false; response: string }
  | { delegate: true; subAgentId: string; subTask: string; mainTask: string };

function parseDecision(raw: string): DelegateDecision {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      parsed.delegate === true &&
      typeof parsed.subAgentId === "string" &&
      typeof parsed.subTask === "string" &&
      typeof parsed.mainTask === "string"
    ) {
      return {
        delegate: true,
        subAgentId: parsed.subAgentId,
        subTask: parsed.subTask,
        mainTask: parsed.mainTask,
      };
    }
    if (parsed.delegate === false && typeof parsed.response === "string") {
      return { delegate: false, response: parsed.response };
    }
  } catch {
    // fall through
  }
  return { delegate: false, response: raw };
}

export async function executeJob(
  jobId: string
): Promise<{ output: string; status: "DELIVERED" | "FAILED" }> {
  // Pre-condition checks — throws propagate to the caller (route handles 404/400)
  const job = await getJobById(jobId);
  if (!job) throw new Error("Job not found");
  console.log("[runtime] job fetched:", job.id, job.status);
  if (job.status !== JobStatus.PAID && job.status !== JobStatus.IN_PROGRESS) {
    throw new Error(`Expected PAID or IN_PROGRESS status, got ${job.status}`);
  }

  // Execution phase — any throw here → FAILED
  try {
    const agentSeed = await getAgentWithSeed(job.agentId);
    if (!agentSeed) throw new Error("Agent seed not found");

    await updateJobStatus(jobId, JobStatus.IN_PROGRESS);
    console.log("[runtime] status set to IN_PROGRESS");

    // Available sub-agents (excluding self)
    const allActive = await getActiveAgents();
    const subAgents = allActive.filter((a) => a.id !== job.agentId);

    const subAgentContext =
      subAgents.length > 0
        ? `\n\nAvailable sub-agents you may delegate to:\n${subAgents
            .map(
              (a) =>
                `- ID: ${a.id} | Name: ${a.name} | Categories: ${a.categoryIds.join(", ")} | Price: ${a.pricePerTask.toString()} USDT`
            )
            .join("\n")}`
        : "\n\nNo sub-agents are currently available.";

    const decisionSystemPrompt = `${agentSeed.systemPrompt}

You must respond with a JSON object only — no other text.

To handle the task yourself:
{"delegate":false,"response":"<your complete answer>"}

To delegate part of the task to a sub-agent from the list below:
{"delegate":true,"subAgentId":"<id>","subTask":"<specific task for sub-agent>","mainTask":"<what you will synthesize using the sub-agent output>"}`;

    // ── First Groq call: decision ──────────────────────────────────────────────
    console.log("[runtime] calling Groq (decision)...");
    const {
      output: decisionRaw,
      promptTokens: dPrompt,
      completionTokens: dCompletion,
    } = await runAgentTask(
      decisionSystemPrompt,
      `Task: ${job.taskDescription}${subAgentContext}`,
      "json"
    );
    console.log("[runtime] Groq response received, tokens:", dPrompt + dCompletion);

    const decision = parseDecision(decisionRaw);

    // ── Scenario A: handle alone ───────────────────────────────────────────────
    if (!decision.delegate) {
      const cleanedResponse = cleanOutput(decision.response);
      await recordSpent(
        job.agentId,
        calcCost(dPrompt + dCompletion),
        `API usage — ${dPrompt + dCompletion} tokens`
      );
      console.log("[runtime] setting DELIVERED");
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JobStatus.DELIVERED, output: cleanedResponse },
      });
      await incrementJobsCompleted(job.agentId);
      return { output: cleanedResponse, status: "DELIVERED" };
    }

    // ── Scenario B: delegate ───────────────────────────────────────────────────
    const subAgent = subAgents.find((a) => a.id === decision.subAgentId);
    const subAgentPrice = subAgent?.pricePerTask.toString() ?? "0";
    const parentBalance = subAgent
      ? await getAgentBalance(agentSeed.walletAddress)
      : "0";
    const canDelegate =
      subAgent && parseFloat(parentBalance) >= parseFloat(subAgentPrice);

    if (!canDelegate) {
      // Fallback: run the task directly
      console.log("[runtime] calling Groq (fallback — no delegate)...");
      const {
        output: fallbackOutput,
        promptTokens: fbPrompt,
        completionTokens: fbCompletion,
      } = await runAgentTask(agentSeed.systemPrompt, job.taskDescription);
      console.log("[runtime] Groq response received, tokens:", dPrompt + dCompletion + fbPrompt + fbCompletion);
      const cleanedFallback = cleanOutput(fallbackOutput);
      await recordSpent(
        job.agentId,
        calcCost(dPrompt + dCompletion + fbPrompt + fbCompletion),
        `API usage — ${dPrompt + dCompletion + fbPrompt + fbCompletion} tokens`
      );
      console.log("[runtime] setting DELIVERED");
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JobStatus.DELIVERED, output: cleanedFallback },
      });
      await incrementJobsCompleted(job.agentId);
      return { output: cleanedFallback, status: "DELIVERED" };
    }

    // Send USDT from parent agent to sub-agent
    const { txHash: subPaymentTxHash } = await sendUsdt(
      job.agentId,
      subAgent.walletAddress,
      subAgentPrice
    );

    // Create sub-job record
    const subJob = await createSubJob({
      parentJobId: jobId,
      parentAgentId: job.agentId,
      subAgentId: subAgent.id,
      taskDescription: decision.subTask,
      priceUsdt: subAgentPrice,
    });

    await updateSubJobStatus(subJob.id, SubJobStatus.IN_PROGRESS);

    // ── Second Groq call: sub-agent executes its task ──────────────────────────
    console.log("[runtime] calling Groq (sub-agent)...");
    const {
      output: subOutput,
      promptTokens: sPrompt,
      completionTokens: sCompletion,
    } = await runAgentTask(subAgent.systemPrompt, decision.subTask);
    console.log("[runtime] Groq response received, tokens:", sPrompt + sCompletion);

    await recordSpent(
      subAgent.id,
      calcCost(sPrompt + sCompletion),
      `API usage — ${sPrompt + sCompletion} tokens`
    );

    await updateSubJobOutput(subJob.id, subOutput, subPaymentTxHash);

    // Record SUB_AGENT_PAYMENT on parent
    await prisma.agentTransaction.create({
      data: {
        agentId: job.agentId,
        type: TransactionType.SUB_AGENT_PAYMENT,
        amountUsdt: subAgentPrice,
        txHash: subPaymentTxHash,
        description: `Hired ${subAgent.name} for subtask`,
      },
    });

    // Increment sub-agent earnings
    await prisma.agent.update({
      where: { id: subAgent.id },
      data: { totalEarned: { increment: subAgentPrice } },
    });

    // ── Third Groq call: parent synthesizes final answer ───────────────────────
    console.log("[runtime] calling Groq (synthesis)...");
    const {
      output: finalOutput,
      promptTokens: fPrompt,
      completionTokens: fCompletion,
    } = await runAgentTask(
      agentSeed.systemPrompt,
      `Original task: ${decision.mainTask}\n\nSub-agent output:\n${subOutput}\n\nUsing the sub-agent output above, complete the original task.`
    );
    console.log("[runtime] Groq response received, tokens:", fPrompt + fCompletion);

    const cleanedFinal = cleanOutput(finalOutput);

    // Record parent SPENT for decision + synthesis calls combined
    await recordSpent(
      job.agentId,
      calcCost(dPrompt + dCompletion + fPrompt + fCompletion),
      `API usage — ${dPrompt + dCompletion + fPrompt + fCompletion} tokens`
    );

    console.log("[runtime] setting DELIVERED");
    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.DELIVERED, output: cleanedFinal },
    });

    await incrementJobsCompleted(job.agentId);
    await incrementJobsCompleted(subAgent.id);

    return { output: cleanedFinal, status: "DELIVERED" };
  } catch (error) {
    console.error("[runtime] FAILED:", error);
    await updateJobStatus(jobId, JobStatus.FAILED).catch(() => null);
    return { output: "", status: "FAILED" };
  }
}
