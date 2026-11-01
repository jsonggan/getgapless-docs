"use client";

import { Check, Loader2, MessageSquare, X } from "lucide-react";
import { motion } from "motion/react";
import { Badge, Cursor, Scene, type SceneState, Stack, useBeats } from "./scene";

const uxBeats = [600, 1100, 1900, 2300, 3300] as const;

export function UiVsUxDemo() {
  return (
    <Scene
      title="UI is not UX"
      steps={[
        { label: "Beautiful, bad experience", duration: 4800, caption: "A polished screen that says nothing when clicked. The UI is good. The UX is not." },
        { label: "Plain, good experience", duration: 4800, caption: "A plain screen that shows progress and confirms the result. Good UI supports good UX, but it does not replace it." },
      ]}
    >
      {(scene) => <UiVsUxStage {...scene} />}
    </Scene>
  );
}

function UiVsUxStage({ step, run }: SceneState) {
  const beat = useBeats(run, uxBeats);
  const press = beat === 2 || beat === 4;
  const uploading = step === 1 && beat >= 2 && beat < 5;
  const finished = step === 1 && beat >= 5;

  return (
    <div className="relative">
      <Stack active={step}>
        <div className="flex h-56 flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 text-white">
          <p className="text-xl font-semibold">Elevate your knowledge</p>
          <span data-target="fancy" className="rounded-full bg-white/20 px-6 py-2 text-sm font-medium shadow-lg backdrop-blur">
            Upload
          </span>
          <p className="min-h-6">{beat >= 4 && <Badge tone="neutral">Did that work?</Badge>}</p>
        </div>
        <div className="flex h-56 flex-col items-center justify-center gap-4 rounded-xl border bg-fd-background p-6 text-sm">
          <p className="font-medium">Upload a document</p>
          <span data-target="plain" className="flex items-center gap-2 rounded-md border px-4 py-1.5">
            {uploading && <Loader2 className="size-4 animate-spin" />}
            {finished && <Check className="size-4 text-fd-success" />}
            {finished ? "Uploaded" : uploading ? "Uploading" : "Upload"}
          </span>
          <p className="min-h-6">{finished && <Badge tone="good">12 pages ready to search</Badge>}</p>
        </div>
      </Stack>
      <Cursor target={beat === 0 ? null : step === 0 ? "fancy" : "plain"} press={press && (step === 0 || beat === 2)} />
    </div>
  );
}

export function CanTheUserTellDemo() {
  return (
    <Scene
      title="Can the user tell?"
      steps={[
        { label: "No", caption: "Blank after sending. Is it working? Can they stop it? The user hesitates and guesses." },
        { label: "Yes", caption: "The screen says what is happening and what they can do. The product feels trustworthy." },
      ]}
    >
      {({ step }) => {
        const clear = step === 1;
        return (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="h-44 rounded-lg border bg-fd-background p-3 text-sm">
              <p className="flex items-center gap-2 border-b pb-2 font-medium">
                <MessageSquare className="size-4" />
                Policy assistant
              </p>
              <p className="mt-3 ml-auto w-fit rounded-lg bg-blue-600 px-2.5 py-1 text-white">How much leave do I get?</p>
              <motion.div
                className="mt-3 flex items-center justify-between"
                initial={false}
                animate={{ opacity: clear ? 1 : 0 }}
              >
                <span className="flex items-center gap-2 text-xs text-fd-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Searching HR policies
                </span>
                <span className="rounded-md border px-2 py-0.5 text-xs">Stop</span>
              </motion.div>
            </div>
            <div className="flex flex-col justify-center gap-3 text-sm">
              <Answer question="What is happening?" yes={clear} />
              <Answer question="What can I do next?" yes={clear} />
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

function Answer({ question, yes }: { question: string; yes: boolean }) {
  return (
    <p className="flex items-center gap-2">
      <motion.span
        key={String(yes)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={yes ? "text-fd-success" : "text-fd-error"}
      >
        {yes ? <Check className="size-4" /> : <X className="size-4" />}
      </motion.span>
      {question}
    </p>
  );
}
