"use client";

import { AlertCircle, Check, Loader2, MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Cursor, Scene, type SceneState, Stack, useBeats, useCount } from "./scene";

const silentBeats = [700, 1000, 1500, 1800, 2300, 2600] as const;
const respondBeats = [700, 1000, 2400] as const;

export function SilentClickDemo() {
  return (
    <Scene
      title="Silence feels broken"
      steps={[
        {
          label: "Silent",
          duration: 4200,
          caption: "The request may be working, but nothing on screen says so. The user clicks again, and may send it three times.",
        },
        {
          label: "Responds",
          duration: 4200,
          caption: "The button reacts at once and shows progress. One click, and the user knows it worked.",
        },
      ]}
    >
      {(scene) => <SilentClickStage {...scene} />}
    </Scene>
  );
}

function SilentClickStage({ step, run }: SceneState) {
  const silent = step === 0;
  const beat = useBeats(run, silent ? silentBeats : respondBeats);
  const clicks = silent ? Math.floor(beat / 2) : Math.min(beat >= 2 ? 1 : 0, 1);
  const press = silent ? beat % 2 === 0 && beat > 0 : beat === 2;
  const working = !silent && beat === 2;
  const done = !silent && beat >= 3;

  return (
    <div className="relative flex h-44 flex-col items-center justify-center gap-4 overflow-hidden rounded-lg bg-fd-muted/50">
      <motion.span
        data-target="send"
        animate={{ scale: !silent && press ? 0.94 : 1 }}
        className="flex min-w-36 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        {working && <Loader2 className="size-4 animate-spin" />}
        {done && <Check className="size-4" />}
        {done ? "Sent" : working ? "Sending" : "Send"}
      </motion.span>
      <Badge tone={silent ? (clicks > 1 ? "bad" : "neutral") : "good"}>
        {clicks} {clicks === 1 ? "click" : "clicks"}, {silent ? "no response" : done ? "confirmed" : "waiting"}
      </Badge>
      <Cursor target={beat === 0 ? null : "send"} press={press} />
    </div>
  );
}

const waits = [
  { label: "Under 0.1 s", limit: 0.1, feel: "Instant", show: "Nothing extra. The result is the feedback." },
  { label: "Up to 1 s", limit: 1, feel: "A short pause", show: "A pressed button or a small spinner." },
  { label: "Up to 10 s", limit: 10, feel: "The user starts to wonder", show: "Clear progress and a Cancel button." },
  { label: "Over 10 s", limit: 30, feel: "Attention drifts", show: "Detailed progress. Let them do something else." },
];

export function ResponseTimeDemo() {
  return (
    <Scene
      title="What to show during a wait"
      steps={waits.map(({ label, feel }) => ({ label, duration: 4000, caption: `${label}: ${feel.toLowerCase()}. The clock is sped up for the longer waits.` }))}
    >
      {(scene) => <ResponseTimeStage {...scene} />}
    </Scene>
  );
}

function ResponseTimeStage({ step, run }: SceneState) {
  const { limit, feel, show } = waits[step];
  const tick = useCount(run, 30, 3000, 200);
  const elapsed = (tick / 30) * limit;
  const finished = tick === 30;

  return (
    <div className="flex h-56 flex-col gap-4 rounded-lg border bg-fd-background p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-semibold tabular-nums">{elapsed.toFixed(limit < 1 ? 2 : 1)} s</span>
        <span className="text-sm text-fd-muted-foreground">{feel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fd-muted">
        <motion.div
          className={cn("h-full rounded-full", step < 2 ? "bg-green-500" : step === 2 ? "bg-amber-500" : "bg-red-500")}
          animate={{ width: `${(tick / 30) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 text-sm">
        {step === 0 && <p className="font-medium">{finished ? "16 weeks of paid leave." : " "}</p>}
        {step === 1 && (
          <p className="flex items-center gap-2">
            {finished ? <Check className="size-4 text-fd-success" /> : <Loader2 className="size-4 animate-spin" />}
            {finished ? "Saved" : "Saving"}
          </p>
        )}
        {step === 2 && (
          <div className="flex items-center justify-between gap-3">
            <span>Searching 3 documents, {Math.round((tick / 30) * 100)}%</span>
            <span className="rounded-md border px-2 py-0.5 text-xs">Cancel</span>
          </div>
        )}
        {step === 3 && (
          <>
            <span>Indexing page {Math.round((tick / 30) * 240)} of 240</span>
            <span className="text-xs text-fd-muted-foreground">You can leave this page. We will notify you when it is done.</span>
          </>
        )}
        <p className="text-xs text-fd-muted-foreground">Show: {show}</p>
      </div>
    </div>
  );
}

const answerWords =
  "Full-time employees get 16 weeks of paid parental leave. You can take it in up to two blocks within the first year after the birth or adoption.".split(
    " ",
  );

const raceTime = 6000;

export function StreamRaceDemo() {
  return (
    <Scene
      title="Same wait, different feeling"
      steps={[
        {
          label: "Race",
          duration: raceTime + 2200,
          caption: "Both answers finish at the same moment. The streaming one starts being useful almost immediately.",
        },
      ]}
    >
      {(scene) => <StreamRaceStage {...scene} />}
    </Scene>
  );
}

function StreamRaceStage({ run }: SceneState) {
  const words = useCount(run, answerWords.length, raceTime - 600, 600);
  const finished = words === answerWords.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="h-44 rounded-lg border bg-fd-background p-3 text-sm">
        <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Spinner, then everything</p>
        {finished ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {answerWords.join(" ")}
          </motion.p>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-fd-muted-foreground" />
          </div>
        )}
      </div>
      <div className="h-44 rounded-lg border bg-fd-background p-3 text-sm">
        <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Word by word</p>
        <p>
          {answerWords.slice(0, words).join(" ")}
          {!finished && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-fd-foreground align-text-bottom" />}
        </p>
      </div>
    </div>
  );
}

export function StatesDemo() {
  return (
    <Scene
      title="One screen, five states"
      steps={[
        { label: "Empty", caption: "First visit. Say what belongs here and how to start, such as example questions." },
        { label: "Loading", caption: "A placeholder in the shape of the content. Never a frozen or blank screen." },
        { label: "Partial", caption: "Show what you already have, with the rest clearly still coming." },
        { label: "Error", caption: "Say what happened in plain words, and offer the next step." },
        { label: "Success", caption: "A quiet confirmation that fades away." },
      ]}
    >
      {({ step }) => (
        <div className="relative overflow-hidden rounded-lg border bg-fd-background">
          <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
            <MessageSquare className="size-4" />
            Policy assistant
          </div>
          <Stack active={step}>
            <div className="flex h-52 flex-col items-center justify-center gap-2 p-4 text-sm">
              <p className="font-medium">Ask about any company policy</p>
              {["How much parental leave do I get?", "Can I work from abroad?"].map((text) => (
                <span key={text} className="rounded-full border px-3 py-1 text-xs">
                  {text}
                </span>
              ))}
            </div>
            <div className="h-52 space-y-3 p-4">
              {["w-full", "w-11/12", "w-2/3"].map((width) => (
                <div key={width} className={cn("h-3 animate-pulse rounded bg-fd-muted", width)} />
              ))}
            </div>
            <div className="h-52 p-4 text-sm">
              <p>Full-time employees get 16 weeks of paid parental leave.</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-fd-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Writing the rest of the answer
              </p>
            </div>
            <div className="flex h-52 flex-col items-center justify-center gap-2 p-4 text-center text-sm">
              <AlertCircle className="size-6 text-fd-error" />
              <p>We could not reach the server. Your question is saved.</p>
              <span className="rounded-md border px-3 py-1 text-xs font-medium">Try again</span>
            </div>
            <div className="h-52 p-4 text-sm">
              <p>Full-time employees get 16 weeks of paid parental leave. You can take it in up to two blocks.</p>
            </div>
          </Stack>
          <AnimatePresence>
            {step === 4 && (
              <motion.p
                className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md bg-fd-success/15 px-3 py-1.5 text-xs font-medium text-fd-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Check className="size-3.5" />
                Copied to clipboard
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </Scene>
  );
}

const errorRules = [
  { label: "Say what happened", bad: "Error 503", good: "We could not reach the server." },
  { label: "Do not blame", bad: "You uploaded an invalid file.", good: "That file type is not supported." },
  { label: "Say what to do next", bad: "Something went wrong.", good: "Something went wrong. Try again in a minute." },
];

const flipBeats = [1300] as const;

export function ErrorMessageDemo() {
  return (
    <Scene
      title="Rewrite the error"
      steps={[
        ...errorRules.map(({ label }) => ({ label, caption: `${label}, in the user's words.` })),
        { label: "Keep their work", caption: "If a message fails to send, the text the user typed must still be there.", duration: 4200 },
      ]}
    >
      {(scene) => <ErrorMessageStage {...scene} />}
    </Scene>
  );
}

function ErrorMessageStage({ step, run }: SceneState) {
  const fixed = useBeats(run, flipBeats) === 1;
  const rule = errorRules[step];

  return (
    <div className="flex h-36 flex-col justify-center rounded-lg bg-fd-muted/50 p-4">
      {rule ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${run}-${fixed}`}
            className={cn(
              "flex items-center gap-2 rounded-md border bg-fd-background px-4 py-3 text-sm font-medium",
              fixed ? "border-fd-success/60" : "border-fd-error/60",
            )}
            initial={{ opacity: 0, rotateX: -60 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 60 }}
            transition={{ duration: 0.25 }}
          >
            {fixed ? <Check className="size-4 text-fd-success" /> : <X className="size-4 text-fd-error" />}
            {fixed ? rule.good : rule.bad}
          </motion.p>
        </AnimatePresence>
      ) : (
        <div className="space-y-2">
          <p className="rounded-md border bg-fd-background px-3 py-2 text-sm">
            {fixed ? "Can I split my leave into two blocks?" : <span className="text-fd-muted-foreground">Ask a question</span>}
          </p>
          <p className="text-xs text-fd-error">Message not sent. {fixed ? "Your text is still here." : "Please retype it."}</p>
        </div>
      )}
    </div>
  );
}

export function PerceivedSpeedDemo() {
  return (
    <Scene
      title="Perceived speed"
      steps={[
        {
          label: "Race",
          duration: 6200,
          caption: "Both take four seconds. The right side shows the user's message at once, then a placeholder, then the first words.",
        },
      ]}
    >
      {(scene) => <PerceivedSpeedStage {...scene} />}
    </Scene>
  );
}

const speedBeats = [300, 1200, 2400, 4000] as const;

function PerceivedSpeedStage({ run }: SceneState) {
  const beat = useBeats(run, speedBeats);
  const question = "How much leave do I get?";
  const answer = "16 weeks of paid leave.";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="h-40 rounded-lg border bg-fd-background p-3 text-sm">
        <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Waits for everything</p>
        {beat >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <p className="ml-auto w-fit rounded-lg bg-blue-600 px-2.5 py-1 text-white">{question}</p>
            <p>{answer}</p>
          </motion.div>
        )}
      </div>
      <div className="h-40 rounded-lg border bg-fd-background p-3 text-sm">
        <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Shows what it can</p>
        <div className="space-y-2">
          {beat >= 1 && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto w-fit rounded-lg bg-blue-600 px-2.5 py-1 text-white">
              {question}
            </motion.p>
          )}
          {beat === 2 && <div className="h-3 w-2/3 animate-pulse rounded bg-fd-muted" />}
          {beat === 3 && <p>16 weeks</p>}
          {beat >= 4 && <p>{answer}</p>}
        </div>
      </div>
    </div>
  );
}
