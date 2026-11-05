"use client";

import { AlertCircle, Check, Copy, Loader2, RotateCcw, ShieldAlert, Square, ThumbsUp, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Scene, type SceneState, Stack, useBeats } from "./scene";

type Status = "pending" | "streaming" | "awaiting_confirmation" | "done" | "stopped" | "failed" | "blocked";

// Same table as the reducer on the page
const allowed: Record<Status, Status[]> = {
  pending: ["streaming", "failed"],
  streaming: ["awaiting_confirmation", "done", "stopped", "failed", "blocked"],
  awaiting_confirmation: ["streaming", "failed"],
  done: ["pending"],
  stopped: ["pending"],
  failed: ["pending"],
  blocked: [],
};

const layout: Status[][] = [
  ["pending", "streaming", "awaiting_confirmation", "done"],
  ["failed", "blocked", "stopped"],
];

type Script = { label: string; caption: string; events: [string, Status][] };

const scripts: Script[] = [
  {
    label: "Normal answer",
    caption: "The first event moves the message to streaming, and the done event finishes it. Two transitions, both in the table.",
    events: [
      ["first event", "streaming"],
      ["done event", "done"],
    ],
  },
  {
    label: "Tool approval",
    caption: "The stream pauses on a confirmation card, and resumes only after the user clicks.",
    events: [
      ["first event", "streaming"],
      ["tool needs approval", "awaiting_confirmation"],
      ["user confirms", "streaming"],
      ["done event", "done"],
    ],
  },
  {
    label: "Late token after Stop",
    caption: "A token that was already in flight arrives after Stop. stopped to streaming is not in the table, so it is ignored instead of restarting the message.",
    events: [
      ["first event", "streaming"],
      ["user stops", "stopped"],
      ["late token", "streaming"],
      ["regenerate", "pending"],
    ],
  },
  {
    label: "Retry after failure",
    caption: "The request fails before any event. The text is kept, and retry sends it again with the same client ID.",
    events: [
      ["request error", "failed"],
      ["retry", "pending"],
      ["first event", "streaming"],
      ["done event", "done"],
    ],
  },
];

const beats = [1000, 2200, 3400, 4600] as const;

function run(script: Script, count: number) {
  let status: Status = "pending";
  const log: { event: string; from: Status; to: Status; applied: boolean }[] = [];
  for (const [event, to] of script.events.slice(0, count)) {
    const applied = allowed[status].includes(to);
    log.push({ event, from: status, to, applied });
    if (applied) status = to;
  }
  return { status, log };
}

export function MessageLifecycleDemo() {
  return (
    <Scene
      title="Message lifecycle"
      steps={scripts.map((script) => ({
        label: script.label,
        duration: 1400 + script.events.length * 1200,
        caption: script.caption,
      }))}
    >
      {(scene) => <LifecycleStage {...scene} />}
    </Scene>
  );
}

function LifecycleStage({ step, run: runId }: SceneState) {
  const script = scripts[step];
  const count = useBeats(runId, beats);
  const { status, log } = run(script, count);
  const rejected = log.at(-1)?.applied === false;

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_15rem]">
      <div className="space-y-4">
        <div className="space-y-2">
          {layout.map((row) => (
            <div key={row.join()} className="grid grid-cols-4 gap-2">
              {row.map((node) => (
                <div
                  key={node}
                  className={cn(
                    "relative flex items-center justify-center rounded-md border px-1.5 py-2 text-center font-mono text-[11px] leading-4 transition-colors",
                    node === status ? "border-transparent text-fd-primary-foreground" : "bg-fd-background text-fd-muted-foreground",
                  )}
                >
                  {node === status && (
                    <motion.span
                      layoutId={`lifecycle-${step}`}
                      className={cn("absolute inset-0 rounded-md", rejected ? "bg-amber-600" : "bg-fd-primary")}
                    />
                  )}
                  <span className="relative">{node.replace("_", "_\u200b")}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <MessagePreview status={status} />
      </div>
      <div className="rounded-lg bg-fd-muted/50 p-3 text-xs">
        <p className="mb-2 font-medium text-fd-muted-foreground">Events</p>
        <p className="mb-1.5 font-mono text-fd-muted-foreground">user sends → pending</p>
        <AnimatePresence initial={false}>
          {log.map((entry) => (
            <motion.div
              key={`${step}-${entry.event}-${entry.from}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "mb-1.5 rounded-md px-2 py-1 font-mono",
                entry.applied ? "bg-fd-background" : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
              )}
            >
              {entry.event} → {entry.to}
              {!entry.applied && (
                <span className="mt-0.5 block font-sans">
                  Ignored: {entry.from} → {entry.to} is not allowed
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const order: Status[] = ["pending", "streaming", "awaiting_confirmation", "done", "stopped", "failed", "blocked"];

function MessagePreview({ status }: { status: Status }) {
  return (
    <div className="rounded-lg border bg-fd-background p-3 text-sm">
      <p className="mb-2 ml-auto w-fit rounded-lg bg-blue-600 px-2.5 py-1 text-white">Reset my VPN access</p>
      <Stack active={order.indexOf(status)}>
        <p className="flex h-20 items-center gap-2 text-fd-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Waiting for the first event
        </p>
        <div className="flex h-20 flex-col justify-between">
          <p>
            I can open a ticket for the IT team
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-fd-foreground align-text-bottom" />
          </p>
          <span className="flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
            <Square className="size-3" />
            Stop
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between rounded-md border p-2 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Wrench className="size-3.5" />
            Create IT ticket: Reset VPN access
          </span>
          <span className="flex gap-2">
            <span className="rounded-md bg-fd-primary px-2 py-0.5 text-fd-primary-foreground">Confirm</span>
            <span className="rounded-md border px-2 py-0.5">Cancel</span>
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between">
          <p>I opened ticket IT-4821. The IT team usually replies within 4 hours.</p>
          <span className="flex gap-3 text-fd-muted-foreground">
            <Copy className="size-3.5" />
            <RotateCcw className="size-3.5" />
            <ThumbsUp className="size-3.5" />
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between">
          <p>I can open a ticket for the IT team</p>
          <span className="flex items-center gap-3 text-xs text-fd-muted-foreground">
            Stopped
            <span className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-fd-foreground">
              <RotateCcw className="size-3" />
              Regenerate
            </span>
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between">
          <p className="flex items-center gap-2">
            <AlertCircle className="size-4 text-fd-error" />
            Could not send. Your message is kept.
          </p>
          <span className="w-fit rounded-md border px-2 py-0.5 text-xs">Retry</span>
        </div>
        <p className="flex h-20 items-center gap-2">
          <ShieldAlert className="size-4 text-fd-error" />
          This response could not be shown.
        </p>
      </Stack>
      <p className="mt-2 flex items-center gap-1.5 border-t pt-2 text-xs text-fd-muted-foreground">
        <Check className="size-3.5" />
        UI for <span className="font-mono">{status}</span>
      </p>
    </div>
  );
}
