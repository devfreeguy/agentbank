"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { AgentSetupStep } from "@/components/onboarding/AgentSetupStep";

export default function NewAgentPage() {
  const router = useRouter();
  const { user, address } = useUser();

  return (
    <main className="w-full max-w-screen px-6.5 py-5.5 pb-20 max-[560px]:px-3.5 max-[560px]:py-3.5 flex-1">
      <AgentSetupStep
        onBack={() => router.push("/dashboard")}
        onProgressChange={() => {}}
        ownerId={user?.id ?? ""}
        walletAddress={address ?? ""}
        isClientAlso={false}
      />
    </main>
  );
}
