"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useBeats, useCount } from "./scene";

const layers = ["Orchestrator", "Model gateway", "Provider"] as const;

export function RetryStormDemo() {
  return (
    <Scene
      title="Retries multiply across layers"
      steps={[
        {
          label: "Every layer tries 3 times",
          duration: 6200,
          caption:
            "The API server tries the orchestrator 3 times, each of those tries the gateway 3 times, and each of those tries the provider 3 times. One user message becomes 27 calls to a provider that is already failing.",
        },
        {
          label: "Only the gateway retries",
          duration: 4400,
          caption: "The layer closest to the provider retries, and nothing above it does. The provider sees 3 calls, and the user gets an answer or an error sooner.",
        },
      ]}
    >
      {(scene) => <RetryStormStage {...scene} />}
    </Scene>
  );
}

function RetryStormStage({ step, run }: SceneState) {
  const storm = step === 0;
  const perLayer = storm ? [3, 3, 3] : [1, 1, 3];
  const totals = perLayer.map((_, index) => perLayer.slice(0, index + 1).reduce((a, b) => a * b, 1));
  const hits = useCount(run, totals[2], storm ? 4200 : 1800, 400);
  // Calls reach each layer in order, so the upper layers lead the provider count
  const shown = totals.map((total) => Math.ceil((hits / totals[2]) * total));

  return (
    <div className="space-y-3">
      {layers.map((layer, index) => (
        <div key={layer} className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="text-fd-muted-foreground">{layer}</span>
          <div className="flex min-h-7 flex-wrap items-center gap-1">
            {Array.from({ length: shown[index] }, (_, call) => (
              <motion.span
                // biome-ignore lint/suspicious/noArrayIndexKey: calls only append
                key={`${step}-${call}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn("size-3 rounded-full", index === 2 ? "bg-fd-error" : "bg-amber-500")}
              />
            ))}
          </div>
          <span className="text-right tabular-nums">
            {shown[index]} {shown[index] === 1 ? "call" : "calls"}
          </span>
        </div>
      ))}
      <div className="flex min-h-6 justify-end">
        {hits === totals[2] && (
          <Badge tone={storm ? "bad" : "good"}>
            {storm ? "27 calls for 1 message" : "3 calls for 1 message"}
          </Badge>
        )}
      </div>
    </div>
  );
}

type Breaker = "Closed" | "Open" | "Half-open";
type Call = { result: "ok" | "timeout" | "fast"; ms: number; label: string };

const phases: { label: string; state: Breaker; provider: string; caption: string; calls: Call[] }[] = [
  {
    label: "Provider fails",
    state: "Closed",
    provider: "Down",
    caption:
      "The breaker is closed, so every call goes to the failing provider and waits for the full timeout. The error rate climbs past the threshold.",
    calls: Array.from({ length: 5 }, () => ({ result: "timeout", ms: 10000, label: "Timed out after 10 s" })),
  },
  {
    label: "Open",
    state: "Open",
    provider: "Down",
    caption:
      "The breaker is open. Calls skip the provider at once and go to the fallback model, with no wait for a timeout. The provider gets no load while it recovers.",
    calls: Array.from({ length: 5 }, () => ({ result: "fast", ms: 150, label: "Sent to fallback at once" })),
  },
  {
    label: "Half-open",
    state: "Half-open",
    provider: "Recovered",
    caption: "After the cool-down, a few trial calls go to the provider. They succeed, so the breaker closes.",
    calls: Array.from({ length: 3 }, () => ({ result: "ok", ms: 1200, label: "Trial call succeeded" })),
  },
  {
    label: "Closed again",
    state: "Closed",
    provider: "Healthy",
    caption: "Traffic flows to the primary provider again. The breaker keeps tracking the error rate.",
    calls: Array.from({ length: 5 }, () => ({ result: "ok", ms: 1200, label: "Answered" })),
  },
];

const states: Breaker[] = ["Closed", "Open", "Half-open"];
const callBeats = [300, 900, 1500, 2100, 2700] as const;

export function CircuitBreakerDemo() {
  return (
    <Scene
      title="Circuit breaker"
      steps={phases.map(({ label, caption }) => ({ label, caption, duration: 4400 }))}
    >
      {(scene) => <BreakerStage {...scene} />}
    </Scene>
  );
}

function BreakerStage({ step, run }: SceneState) {
  const phase = phases[step];
  const started = useBeats(run, callBeats);
  const calls = phase.calls.slice(0, started);
  const failures = step === 0 ? calls.length : 0;
  const errorRate = step === 0 ? Math.round((failures / phase.calls.length) * 100) : 0;
  const tripped = step === 0 && errorRate >= 50;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {states.map((state) => (
            <span
              key={state}
              className={cn(
                "relative rounded-md border px-3 py-1",
                state === phase.state ? "border-transparent text-fd-primary-foreground" : "text-fd-muted-foreground",
              )}
            >
              {state === phase.state && (
                <motion.span
                  layoutId="breaker-state"
                  className={cn(
                    "absolute inset-0 rounded-md",
                    state === "Open" ? "bg-fd-error" : state === "Half-open" ? "bg-amber-500" : "bg-fd-success",
                  )}
                />
              )}
              <span className="relative">{state}</span>
            </span>
          ))}
        </div>
        <span className="text-xs text-fd-muted-foreground">
          Primary provider:{" "}
          <span className={phase.provider === "Down" ? "text-fd-error" : "text-fd-success"}>{phase.provider}</span>
        </span>
      </div>
      <div className="space-y-1.5 rounded-lg border bg-fd-background p-3">
        <div className="flex justify-between text-[10px] text-fd-muted-foreground">
          <span>Call time</span>
          <span>10 s timeout</span>
        </div>
        {phase.calls.map((call, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed rows per phase
          <div key={`${step}-${index}`} className="grid h-5 grid-cols-[1fr_9.5rem] items-center gap-3">
            <div className="h-2 rounded-full bg-fd-muted">
              {index < calls.length && (
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    call.result === "timeout" ? "bg-fd-error" : call.result === "fast" ? "bg-amber-500" : "bg-fd-success",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, (call.ms / 10000) * 100)}%` }}
                  transition={{ duration: (call.ms / 10000) * 1.2, ease: "linear" }}
                />
              )}
            </div>
            {index < calls.length ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (call.ms / 10000) * 1.2 }}
                className="truncate text-xs text-fd-muted-foreground"
              >
                {call.label}
              </motion.span>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs text-fd-muted-foreground">
        {step === 0 ? (
          <span className="tabular-nums">Error rate {errorRate}%, threshold 50%</span>
        ) : step === 1 ? (
          <span>Calls sent to the failing provider: 0. Cool-down: 30 s</span>
        ) : (
          <span>Error rate 0%</span>
        )}
        {tripped && <Badge tone="bad">Threshold passed, breaker opens</Badge>}
        {step === 1 && started >= 5 && <Badge tone="good">No waiting for timeouts</Badge>}
        {step === 2 && started >= 3 && <Badge tone="good">Trials passed, breaker closes</Badge>}
      </div>
    </div>
  );
}
