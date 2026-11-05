"use client";

import { FileText, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useBeats } from "./scene";

const documents = [
  { id: "falcon", title: "Project Falcon: acquisition terms", allowed: false, match: true },
  { id: "board", title: "Board minutes, March", allowed: false, match: true },
  { id: "news", title: "Company news: Q1 results", allowed: true, match: true },
  { id: "travel", title: "Travel policy 2025", allowed: true, match: false },
  { id: "handbook", title: "Sales handbook", allowed: true, match: false },
];

const beats = [500, 1400, 2400, 3300] as const;

export function PermissionFilterDemo() {
  return (
    <Scene
      title="Where the permission check happens"
      steps={[
        {
          label: "Ask the model to filter",
          duration: 5600,
          caption:
            "Restricted documents are retrieved and the prompt tells the model not to reveal them. The model refuses, but the refusal names the project. The user now knows it exists.",
        },
        {
          label: "Filter inside the search",
          duration: 5600,
          caption:
            "The ACL filter is part of the search query, so restricted chunks are never returned. Nothing restricted reaches the prompt, so nothing can leak from it.",
        },
      ]}
    >
      {(scene) => <PermissionStage {...scene} />}
    </Scene>
  );
}

function PermissionStage({ step, run }: SceneState) {
  const filtered = step === 1;
  const beat = useBeats(run, beats);
  const retrieved = documents.filter((doc) => doc.match && (doc.allowed || !filtered));

  return (
    <div className="space-y-3 text-sm">
      <p className="rounded-md bg-fd-muted/50 px-3 py-2">
        <span className="text-fd-muted-foreground">Sales rep asks: </span>
        Is the company buying another company?
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <Column title={filtered ? "Index, searched with the user's groups" : "Index, searched without a filter"}>
          {documents.map((doc) => {
            const hidden = filtered && !doc.allowed;
            const hit = beat >= 1 && retrieved.includes(doc);
            return (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all duration-300",
                  hit ? (doc.allowed ? "bg-sky-500/15" : "bg-fd-error/15") : "bg-fd-muted/50",
                  hidden && "opacity-35",
                )}
              >
                {doc.allowed ? <FileText className="size-3.5 shrink-0" /> : <Lock className="size-3.5 shrink-0 text-fd-error" />}
                <span className="truncate">{doc.title}</span>
              </div>
            );
          })}
          {filtered && beat >= 1 && <p className="text-[10px] text-fd-muted-foreground">Board-only documents never match</p>}
        </Column>
        <Column title="Prompt">
          {!filtered && beat >= 2 && (
            <p className="rounded-md bg-amber-500/15 px-2 py-1 text-xs">Do not reveal documents the user cannot access.</p>
          )}
          <AnimatePresence>
            {beat >= 2 &&
              retrieved.map((doc, index) => (
                <motion.p
                  key={`${step}-${doc.id}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className={cn("rounded-md px-2 py-1 text-xs", doc.allowed ? "bg-sky-500/15" : "bg-fd-error/15")}
                >
                  [{index + 1}] {doc.title}
                </motion.p>
              ))}
          </AnimatePresence>
        </Column>
        <Column title="Answer">
          {beat >= 3 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs leading-5">
              {filtered ? (
                "I could not find anything about acquisitions in the documents you have access to. The latest company news covers Q1 results."
              ) : (
                <>
                  I can&apos;t share details of the <mark className="rounded bg-fd-error/20 px-0.5 text-fd-error">Project Falcon acquisition</mark>.
                </>
              )}
            </motion.p>
          )}
        </Column>
      </div>
      <div className="flex min-h-6 justify-end">
        {beat >= 4 && (
          <Badge tone={filtered ? "good" : "bad"}>
            {filtered ? "Nothing restricted reached the prompt" : "The refusal confirmed a secret project"}
          </Badge>
        )}
      </div>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5 rounded-lg border bg-fd-background p-2.5">
      <p className="text-xs font-medium text-fd-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
