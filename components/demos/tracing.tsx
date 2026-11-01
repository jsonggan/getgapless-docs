"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Scene, type SceneState, useCount } from "./scene";

type Span = { name: string; start: number; duration: number; depth: number };

// Durations from the trace on this page, laid out in the order the steps run
const spans: Span[] = [
  { name: "chat.turn", start: 0, duration: 4752, depth: 0 },
  { name: "history.load", start: 0, duration: 12, depth: 1 },
  { name: "guardrail.input", start: 12, duration: 45, depth: 1 },
  { name: "llm.query_rewrite", start: 57, duration: 380, depth: 1 },
  { name: "retrieval.search", start: 437, duration: 290, depth: 1 },
  { name: "search.keyword", start: 437, duration: 40, depth: 2 },
  { name: "search.vector", start: 437, duration: 60, depth: 2 },
  { name: "rerank", start: 497, duration: 170, depth: 2 },
  { name: "llm.generate", start: 727, duration: 3900, depth: 1 },
  { name: "guardrail.output", start: 4627, duration: 110, depth: 1 },
  { name: "message.save", start: 4737, duration: 15, depth: 1 },
];

const total = spans[0].duration;
const ttft = 820;
const generate = spans.find((span) => span.name === "llm.generate") as Span;
const ticks = 60;

const format = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

export function TraceWaterfallDemo() {
  return (
    <Scene
      title="The same trace as a timeline"
      steps={[
        {
          label: "Timeline",
          duration: 5600,
          caption:
            "Each span is a bar placed at its start time and sized by its duration. Child spans sit inside their parent, so retrieval breaks down into its searches and the re-rank.",
        },
        {
          label: "Largest step",
          duration: 5000,
          caption: `Generation takes ${Math.round((generate.duration / total) * 100)}% of the turn, and the first token arrived ${ttft} ms into it. Everything before generation adds up to under a second, so the big savings are in the model call.`,
        },
      ]}
    >
      {(scene) => <WaterfallStage {...scene} />}
    </Scene>
  );
}

function WaterfallStage({ step, run }: SceneState) {
  const focus = step === 1;
  const tick = useCount(run, ticks, 3600, 300);
  const now = focus ? total : (tick / ticks) * total;

  return (
    <div className="space-y-1 text-xs">
      {spans.map((span) => {
        const started = now >= span.start;
        const shown = Math.max(0, Math.min(span.duration, now - span.start));
        const dim = focus && span.name !== "llm.generate" && span.name !== "chat.turn";
        return (
          <div key={span.name} className={cn("grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-2 transition-opacity", dim && "opacity-35")}>
            <span className="truncate font-mono" style={{ paddingLeft: span.depth * 10 }}>
              {span.name}
            </span>
            <div className="relative h-4">
              {started && (
                <div
                  className={cn(
                    "absolute top-0.5 bottom-0.5 rounded-sm",
                    span.depth === 0 ? "bg-fd-muted-foreground/30" : span.name.startsWith("llm") ? "bg-violet-500" : span.depth === 2 ? "bg-sky-400" : "bg-sky-600",
                  )}
                  style={{ left: `${(span.start / total) * 100}%`, width: `max(2px, ${(shown / total) * 100}%)` }}
                />
              )}
              {span.name === "llm.generate" && now >= span.start + ttft && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-1 -bottom-1 w-0.5 bg-amber-500"
                  style={{ left: `${((span.start + ttft) / total) * 100}%` }}
                >
                  <span className="absolute -top-3 left-1.5 whitespace-nowrap rounded bg-fd-card px-0.5 text-[10px] leading-3 text-amber-700 dark:text-amber-400">
                    first token
                  </span>
                </motion.span>
              )}
            </div>
            <span className="text-right tabular-nums text-fd-muted-foreground">{started ? format(span.duration) : ""}</span>
          </div>
        );
      })}
      <div className="grid grid-cols-[9.5rem_1fr_3.5rem] gap-2 pt-1 text-[10px] text-fd-muted-foreground">
        <span />
        <div className="flex justify-between border-t pt-1">
          <span>0 s</span>
          <span>{format(total / 2)}</span>
          <span>{format(total)}</span>
        </div>
        <span />
      </div>
    </div>
  );
}
