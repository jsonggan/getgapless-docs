"use client";

import { Bot, CircleStop, Hand, MessageSquare, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useBeats } from "./scene";

type Row = { kind: "model" | "read" | "write" | "result" | "confirm" | "answer" | "stop"; text: string; step?: number };

const maxSteps = 10;

const runs: { label: string; caption: string; rows: Row[]; verdict: { tone: "good" | "bad"; text: string } }[] = [
  {
    label: "Finishes",
    caption:
      "Each loop step is one model call. The model asks for a read tool, gets the result, and decides what to do next. When it answers without a tool call, the loop ends.",
    rows: [
      { kind: "model", text: "I should look for open VPN tickets", step: 1 },
      { kind: "read", text: 'search_tickets({ query: "VPN", status: "open" })' },
      { kind: "result", text: "3 tickets, newest INC-48211" },
      { kind: "model", text: "Read the newest one", step: 2 },
      { kind: "read", text: 'get_ticket({ id: "INC-48211" })' },
      { kind: "result", text: "Gateway certificate expired, fix in progress" },
      { kind: "model", text: "No tool call needed", step: 3 },
      { kind: "answer", text: "The VPN outage is INC-48211. A fix is in progress." },
    ],
    verdict: { tone: "good", text: "Answered in 3 steps" },
  },
  {
    label: "Write needs approval",
    caption:
      "A write tool pauses the loop. The user sees the exact values and clicks Confirm, so a confused model or an injected instruction cannot act alone.",
    rows: [
      { kind: "model", text: "The user asked me to open a ticket", step: 1 },
      { kind: "write", text: 'create_ticket({ title: "VPN drops every hour", priority: "P3" })' },
      { kind: "confirm", text: "Waiting for the user. Confirm, Edit, or Cancel" },
      { kind: "result", text: "User confirmed. Created INC-48230" },
      { kind: "model", text: "No tool call needed", step: 2 },
      { kind: "answer", text: "I opened INC-48230 for the IT team." },
    ],
    verdict: { tone: "good", text: "1 write, confirmed by a click" },
  },
  {
    label: "Stuck",
    caption:
      "The model repeats the same call with the same arguments. Three identical calls in a row means it is stuck, so the loop stops long before the step limit and tells the user.",
    rows: [
      { kind: "model", text: "Search for the policy", step: 1 },
      { kind: "read", text: 'search_docs({ query: "travel policy" })' },
      { kind: "result", text: "0 results" },
      { kind: "model", text: "Search for the policy", step: 2 },
      { kind: "read", text: 'search_docs({ query: "travel policy" })' },
      { kind: "result", text: "0 results" },
      { kind: "model", text: "Search for the policy", step: 3 },
      { kind: "read", text: 'search_docs({ query: "travel policy" })' },
      { kind: "stop", text: "Same call 3 times in a row. Stopped and told the user." },
    ],
    verdict: { tone: "bad", text: "Stopped at step 3" },
  },
];

const rowBeats = [400, 1000, 1600, 2200, 2800, 3400, 4000, 4600, 5200, 5800] as const;

export function AgentLoopDemo() {
  return (
    <Scene
      title="The agent loop"
      steps={runs.map(({ label, caption, rows }) => ({ label, caption, duration: 1400 + rows.length * 600 + 1600 }))}
    >
      {(scene) => <AgentStage {...scene} />}
    </Scene>
  );
}

const icons: Record<Row["kind"], ReactNode> = {
  model: <Bot className="size-3.5" />,
  read: <Wrench className="size-3.5" />,
  write: <Wrench className="size-3.5" />,
  result: <span className="text-[10px]">↳</span>,
  confirm: <Hand className="size-3.5" />,
  answer: <MessageSquare className="size-3.5" />,
  stop: <CircleStop className="size-3.5" />,
};

function AgentStage({ step, run }: SceneState) {
  const { rows, verdict } = runs[step];
  const shown = useBeats(run, rowBeats);
  const visible = rows.slice(0, shown);
  const current = Math.max(0, ...visible.map((row) => row.step ?? 0));
  const repeated = step === 2 ? visible.filter((row) => row.kind === "read").length : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
      <div className="min-h-72 space-y-1.5 text-xs">
        <AnimatePresence initial={false}>
          {visible.map((row, index) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: rows only append
              key={`${step}-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-2 rounded-md px-2 py-1.5",
                row.kind === "model" && "bg-violet-500/10",
                (row.kind === "read" || row.kind === "write") && "ml-5 font-mono",
                row.kind === "read" && (step === 2 ? "bg-amber-500/15" : "bg-sky-500/10"),
                row.kind === "write" && "bg-orange-500/15",
                row.kind === "result" && "ml-5 text-fd-muted-foreground",
                row.kind === "confirm" && "ml-5 border border-dashed border-orange-500/60",
                row.kind === "answer" && "bg-fd-success/10",
                row.kind === "stop" && "bg-fd-error/10 text-fd-error",
              )}
            >
              <span className="mt-0.5 shrink-0">{icons[row.kind]}</span>
              <span className="min-w-0 break-words">
                {row.step && <span className="mr-1.5 font-medium">Step {row.step}.</span>}
                {row.kind === "write" && <span className="mr-1.5 font-sans font-medium text-orange-700 dark:text-orange-400">write</span>}
                {row.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="space-y-3 text-xs">
        <div>
          <p className="mb-1 text-fd-muted-foreground">
            Step {current} of max {maxSteps}
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: maxSteps }, (_, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed slots
                key={index}
                className={cn("h-2 flex-1 rounded-sm transition-colors", index < current ? "bg-violet-500" : "bg-fd-muted")}
              />
            ))}
          </div>
        </div>
        {step === 2 && (
          <p className="text-fd-muted-foreground">
            Identical calls in a row: <span className={cn("font-medium", repeated >= 3 && "text-fd-error")}>{repeated}</span>
          </p>
        )}
        {shown >= rows.length && <Badge tone={verdict.tone}>{verdict.text}</Badge>}
      </div>
    </div>
  );
}
