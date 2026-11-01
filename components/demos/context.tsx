"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useBeats, useCount } from "./scene";

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

const turnTokens = 400;
const keepTurns = 6;
const summaryTokens = 500;
const historyBudget = 4000;
const turnCount = 14;

export function HistoryBudgetDemo() {
  return (
    <Scene
      title="History over a long conversation"
      steps={[
        {
          label: "Send every turn",
          duration: 7000,
          caption:
            "Every turn adds about 400 tokens and nothing leaves. After turn 10 the history passes its 4,000 token budget, and every call keeps getting slower and more expensive.",
        },
        {
          label: "Summary + recent turns",
          duration: 7000,
          caption:
            "The last 6 turns stay in full. Older turns fold into a running summary of about 500 tokens that keeps stated facts, such as the user's city and project name.",
        },
      ]}
    >
      {(scene) => <HistoryStage {...scene} />}
    </Scene>
  );
}

const facts = ["Based in Berlin", "Project Atlas", "Prefers short answers"];
const summaryBeats = [4200] as const;

function HistoryStage({ step, run }: SceneState) {
  const trimmed = step === 1;
  const turns = useCount(run, turnCount, 4200, 300);
  const beat = useBeats(run, summaryBeats);
  const folded = trimmed ? Math.max(0, turns - keepTurns) : 0;
  const kept = turns - folded;
  const tokens = kept * turnTokens + (folded > 0 ? summaryTokens : 0);
  const over = tokens > historyBudget;
  const max = turnCount * turnTokens;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex h-12 items-end gap-1">
        {folded > 0 && (
          <motion.div
            layout
            className="flex h-full shrink-0 items-center justify-center rounded-md bg-violet-500/80 px-2 text-[10px] font-medium text-white"
            style={{ width: `${(summaryTokens / max) * 100}%` }}
          >
            Summary
          </motion.div>
        )}
        {Array.from({ length: kept }, (_, index) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: the key is the turn number, which stays stable as turns fold
            key={folded + index}
            layout
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="h-full shrink-0 origin-bottom rounded-md bg-emerald-500/80"
            style={{ width: `${(turnTokens / max) * 100 - 0.5}%` }}
          />
        ))}
      </div>
      <div className="relative h-2 rounded-full bg-fd-muted">
        <motion.div
          className={cn("h-full rounded-full", over ? "bg-fd-error" : "bg-fd-success")}
          animate={{ width: `${(tokens / max) * 100}%` }}
        />
        <span className="absolute -top-1 h-4 w-0.5 bg-fd-foreground" style={{ left: `${(historyBudget / max) * 100}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="tabular-nums text-fd-muted-foreground">
          Turn {turns}: history is {tokens.toLocaleString("en-US")} tokens. Budget {historyBudget.toLocaleString("en-US")}.
        </span>
        {beat >= 1 && <Badge tone={over ? "bad" : "good"}>{over ? "Over budget, still growing" : "Stays under budget"}</Badge>}
      </div>
      <div className="min-h-7">
        {trimmed && folded > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-fd-muted-foreground">Summary keeps:</span>
            {facts.map((fact) => (
              <span key={fact} className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-700 dark:text-violet-300">
                {fact}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
