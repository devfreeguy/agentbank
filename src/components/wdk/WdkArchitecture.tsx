import { ArrowDown, ArrowRight, Globe, Server, Box } from "lucide-react";
import { SectionTag } from "@/components/shared/SectionTag";

const archNodes = [
  {
    icon: Globe,
    label: "Next.js App",
    sub: "API routes / server-side",
    color: "text-foreground",
    borderColor: "border-[rgba(255,255,255,0.12)]",
    bgColor: "bg-card",
  },
  {
    icon: Server,
    label: "WDK Microservice",
    sub: "Node.js / Express — port 3001",
    color: "text-(--orange)",
    borderColor: "border-(--orange-border)",
    bgColor: "bg-(--orange-dim)",
  },
  {
    icon: Box,
    label: "Base Blockchain",
    sub: "EVM L2 — ~2s blocks",
    color: "text-(--green)",
    borderColor: "border-[rgba(34,197,94,0.25)]",
    bgColor: "bg-[rgba(34,197,94,0.05)]",
  },
];

const callLabels = ["Signed requests + secret", "eth_call / eth_getLogs / broadcast"];

const designPoints = [
  {
    title: "Why a separate service?",
    body: "Payment verification polls the blockchain for up to 10 minutes — far beyond Next.js serverless limits. A long-lived Express process handles this without timeouts.",
  },
  {
    title: "Secret-gated communication",
    body: "Every request from Next.js to the WDK service must include an x-wdk-service-secret header. Requests without the correct secret are rejected with 401.",
  },
  {
    title: "Direct RPC — no middlemen",
    body: "The WDK service calls Base RPC nodes directly for balance checks and payment verification, rotating through four fallback nodes with automatic retry on rate-limit errors.",
  },
  {
    title: "Four fallback RPC nodes",
    body: "Alchemy, LlamaRPC, MeowRPC, and 1RPC are tried in sequence per request. If one returns 429 or errors, the next is used immediately — no single point of failure.",
  },
];

export function WdkArchitecture() {
  return (
    <section
      id="architecture"
      className="bg-sidebar border-y border-border py-14 sm:py-16 px-5 sm:px-12"
    >
      <div className="max-w-3xl mx-auto">
        <SectionTag className="mb-2.5">Architecture</SectionTag>
        <h2 className="font-head text-[22px] sm:text-[32px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          Three-layer wallet stack
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-muted-foreground leading-[1.65] font-light mb-8 sm:mb-10 max-w-xl">
          The Next.js app never touches the blockchain directly. Wallet operations
          flow through a dedicated microservice that handles encryption and chain
          interaction.
        </p>

        {/* Flow diagram */}
        <div className="bg-background border border-border rounded-[16px] p-5 sm:p-6 mb-8">
          {/* Mobile: vertical */}
          <div className="flex flex-col items-center sm:hidden">
            {archNodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={node.label} className="flex flex-col items-center w-full">
                  <div
                    className={`w-full max-w-[220px] ${node.bgColor} border ${node.borderColor} rounded-[12px] px-4 py-3 flex flex-col items-center text-center`}
                  >
                    <Icon
                      size={15}
                      className={`${node.color} mb-1.5`}
                      strokeWidth={1.6}
                    />
                    <div className={`font-head text-[13px] font-semibold ${node.color}`}>
                      {node.label}
                    </div>
                    <div className="text-[11px] text-(--hint) mt-0.5">{node.sub}</div>
                  </div>
                  {i < archNodes.length - 1 && (
                    <div className="flex flex-col items-center py-2 gap-0.5">
                      <div className="text-[10px] text-(--hint) font-mono whitespace-nowrap">
                        {callLabels[i]}
                      </div>
                      <ArrowDown size={12} className="text-(--hint)" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden sm:flex items-center gap-0">
            {archNodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={node.label} className="flex items-center flex-1">
                  <div
                    className={`${node.bgColor} border ${node.borderColor} rounded-[12px] px-4 py-4 flex flex-col items-center text-center flex-1`}
                  >
                    <Icon
                      size={16}
                      className={`${node.color} mb-2`}
                      strokeWidth={1.6}
                    />
                    <div
                      className={`font-head text-[13px] font-semibold ${node.color}`}
                    >
                      {node.label}
                    </div>
                    <div className="text-[11px] text-(--hint) mt-0.5">{node.sub}</div>
                  </div>
                  {i < archNodes.length - 1 && (
                    <div className="flex flex-col items-center px-3 shrink-0 gap-1">
                      <div className="text-[9.5px] text-(--hint) font-mono whitespace-nowrap text-center leading-[1.4]">
                        {callLabels[i]}
                      </div>
                      <ArrowRight
                        size={13}
                        className="text-(--hint)"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Design points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {designPoints.map((pt) => (
            <div
              key={pt.title}
              className="bg-card border border-border rounded-[14px] p-4 sm:p-5 hover:border-(--border-med) transition-colors duration-200"
            >
              <h3 className="font-head text-[13.5px] sm:text-[14px] font-semibold mb-1.5">
                {pt.title}
              </h3>
              <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-[1.65] font-light">
                {pt.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
