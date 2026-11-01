"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useCount } from "./scene";

type Segment = { name: string; tokens: number; tint: string };

const instructions = { name: "Instructions", tokens: 1500, tint: "bg-sky-500" };
const tools = { name: "Tools", tokens: 1000, tint: "bg-indigo-500" };
const sourcesA = { name: "Sources", tokens: 6000, tint: "bg-amber-500" };
const sourcesB = { name: "Sources", tokens: 6000, tint: "bg-orange-500" };
const history = { name: "History", tokens: 3000, tint: "bg-emerald-500" };
const historyB = { name: "History", tokens: 3000, tint: "bg-teal-500" };
const questionA = { name: "Q", tokens: 500, tint: "bg-fuchsia-500" };
const questionB = { name: "Q", tokens: 500, tint: "bg-pink-500" };
const stampA = { name: "Instr. 09:41:07", tokens: 1500, tint: "bg-sky-500" };
const stampB = { name: "Instr. 09:41:52", tokens: 1500, tint: "bg-cyan-500" };

const layouts: { label: string; caption: string; first: Segment[]; second: Segment[] }[] = [
  {
    label: "Stable content first",
    caption:
      "Instructions and tool definitions are identical on every call and come first, so the next request reuses them from the cache. Only what follows the first difference is processed at full price.",
    first: [instructions, tools, sourcesA, history, questionA],
    second: [instructions, tools, sourcesB, historyB, questionB],
  },
  {
    label: "Timestamp in instructions",
    caption:
      "A time with seconds in the system prompt makes the very first block different on every call. Nothing after it can match, so nothing is cached.",
    first: [stampA, tools, sourcesA, history, questionA],
    second: [stampB, tools, sourcesB, historyB, questionB],
  },
  {
    label: "Sources first",
    caption:
      "Sources change with every question. Put them first and the prefix differs right away, even though the instructions behind them never changed.",
    first: [sourcesA, instructions, tools, history, questionA],
    second: [sourcesB, instructions, tools, historyB, questionB],
  },
];

const same = (a: Segment, b: Segment) => a.name === b.name && a.tint === b.tint;

function cachedCount(first: Segment[], second: Segment[]) {
  let count = 0;
  while (count < second.length && same(first[count], second[count])) count += 1;
  return count;
}

const total = (segments: Segment[]) => segments.reduce((sum, segment) => sum + segment.tokens, 0);

export function PromptCacheDemo() {
  return (
    <Scene
      title="What the next request can reuse"
      steps={layouts.map(({ label, caption }) => ({ label, caption, duration: 5200 }))}
    >
      {(scene) => <CacheStage {...scene} />}
    </Scene>
  );
}

function CacheStage({ step, run }: SceneState) {
  const { first, second } = layouts[step];
  const matched = cachedCount(first, second);
  // The scan walks the second prompt block by block, stopping at the first difference
  const scanned = useCount(run, Math.min(second.length, matched + 1), 1600, 500);
  const cachedTokens = total(second.slice(0, Math.min(scanned, matched)));
  const done = scanned === Math.min(second.length, matched + 1);
  const all = total(second);

  return (
    <div className="space-y-4 text-sm">
      <PromptRow label="Request 1" segments={first} />
      <PromptRow
        label="Request 2"
        segments={second}
        state={(index) =>
          index < matched ? (index < scanned ? "cached" : "pending") : scanned > matched ? "miss" : "pending"
        }
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-fd-success" />
          Cached prefix
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-fd-error" />
          Processed in full, from the first difference on
        </span>
        <span className="text-fd-muted-foreground">Example sizes in tokens</span>
      </div>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="tabular-nums text-fd-muted-foreground">
          Cached: {cachedTokens.toLocaleString("en-US")} of {all.toLocaleString("en-US")} input tokens
        </span>
        {done && (
          <Badge tone={matched > 0 ? "good" : "bad"}>
            {matched > 0 ? `${Math.round((cachedTokens / all) * 100)}% reused` : "Cache miss on every call"}
          </Badge>
        )}
      </div>
    </div>
  );
}

function PromptRow({
  label,
  segments,
  state,
}: {
  label: string;
  segments: Segment[];
  state?: (index: number) => "pending" | "cached" | "miss";
}) {
  const sum = total(segments);
  return (
    <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
      <span className="text-xs text-fd-muted-foreground">{label}</span>
      <div className="flex h-10 gap-0.5 overflow-hidden rounded-md">
        {segments.map((segment, index) => {
          const status = state?.(index);
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed order
              key={index}
              className="relative flex min-w-0 items-center justify-center"
              style={{ width: `${(segment.tokens / sum) * 100}%` }}
            >
              <span className={cn("absolute inset-0 opacity-80", segment.tint)} />
              {status && status !== "pending" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "absolute inset-0 ring-2 ring-inset",
                    status === "cached" ? "bg-fd-success/60 ring-fd-success" : "bg-fd-error/50 ring-fd-error",
                  )}
                />
              )}
              <span className="relative line-clamp-2 px-1 text-center text-[10px] leading-3 font-medium text-white">{segment.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
