"use client";

import { Check, FileText, Search, Send, Settings, Sparkles, Trash2, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Cursor, Scene, type SceneState, Stack, useBeats } from "./scene";

const hunt = ["hunt-a", "hunt-b", "hunt-c", "send-odd"] as const;
const huntBeats = [500, 1100, 1700, 2500, 2900] as const;
const directBeats = [500, 1100] as const;

export function FamiliarPatternsDemo() {
  return (
    <Scene
      title="Familiar beats clever"
      steps={[
        { label: "Original layout", duration: 4600, caption: "A creative layout means the user must hunt. Every new pattern is something to learn." },
        { label: "Familiar layout", duration: 3600, caption: "Search at the top, settings behind a gear, and Send on the right of the box. The hand already knows the way." },
      ]}
    >
      {(scene) => <FamiliarStage {...scene} />}
    </Scene>
  );
}

function FamiliarStage({ step, run }: SceneState) {
  const familiar = step === 1;
  const beat = useBeats(run, familiar ? directBeats : huntBeats);
  const target = familiar ? (beat >= 1 ? "send-normal" : null) : beat >= 1 ? (hunt[Math.min(beat - 1, 3)] ?? null) : null;
  const press = familiar ? beat === 2 : beat === 5;

  return (
    <div className="relative">
      <Stack active={step}>
        <div className="flex h-52 flex-col justify-between rounded-lg border bg-fd-background p-3 text-sm">
          <div className="flex items-center justify-between">
            <span data-target="send-odd" className="rounded-full bg-blue-600 p-2 text-white">
              <Sparkles className="size-4" />
            </span>
            <span data-target="hunt-a" className="text-xs text-fd-muted-foreground">
              Options
            </span>
          </div>
          <span data-target="hunt-b" className="self-center text-xs text-fd-muted-foreground">
            Find
          </span>
          <div data-target="hunt-c" className="rounded-md border px-3 py-1.5 text-fd-muted-foreground">
            Ask a question
          </div>
        </div>
        <div className="flex h-52 flex-col justify-between rounded-lg border bg-fd-background p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-fd-muted-foreground">
              <Search className="size-3.5" />
              Search
            </span>
            <Settings className="size-4 text-fd-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1 rounded-md border px-3 py-1.5 text-fd-muted-foreground">Ask a question</span>
            <span data-target="send-normal" className="rounded-md bg-blue-600 p-2 text-white">
              <Send className="size-4" />
            </span>
          </div>
        </div>
      </Stack>
      <Cursor target={target} press={press} />
    </div>
  );
}

const fakeBeats = [500, 1300, 2000, 2800] as const;

export function ClickableDemo() {
  return (
    <Scene
      title="Clickable things look clickable"
      steps={[
        { label: "Guessing", duration: 4400, caption: "The real action is plain text, so the user misses it. The decorative pill looks like a button but does nothing." },
        { label: "Obvious", duration: 4400, caption: "The action looks like a button, and the label looks like a label. Nobody has to guess." },
      ]}
    >
      {(scene) => <ClickableStage {...scene} />}
    </Scene>
  );
}

function ClickableStage({ step, run }: SceneState) {
  const obvious = step === 1;
  const beat = useBeats(run, fakeBeats);
  const target = beat === 0 ? null : obvious ? "real" : beat < 3 ? "pill" : "plain";
  const press = obvious ? beat === 2 : beat === 2;

  return (
    <div className="relative flex h-40 flex-col justify-center gap-4 rounded-lg border bg-fd-background p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">handbook.pdf</span>
        <motion.span
          data-target="pill"
          animate={{ x: !obvious && press ? [0, -4, 4, -2, 0] : 0 }}
          className={cn(
            "transition-all",
            obvious ? "text-xs text-fd-muted-foreground" : "rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white",
          )}
        >
          Indexed
        </motion.span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-fd-muted-foreground">24 pages</span>
        {obvious ? (
          <motion.span
            data-target="real"
            animate={{ scale: press ? 0.94 : 1 }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Replace document
          </motion.span>
        ) : (
          <span data-target="plain" className="text-xs text-fd-muted-foreground">
            Replace document
          </span>
        )}
      </div>
      <Cursor target={target} press={press} />
    </div>
  );
}

const allOptions = [
  { name: "Ask a question", tier: 0 },
  { name: "Upload a document", tier: 1 },
  { name: "New chat", tier: 1 },
  { name: "Model temperature", tier: 2 },
  { name: "Top P", tier: 2 },
  { name: "Max tokens", tier: 2 },
  { name: "Retrieval depth", tier: 2 },
  { name: "Export as JSON", tier: 2 },
  { name: "Chunk size", tier: 2 },
];

export function ChoicesDemo() {
  return (
    <Scene
      title="Fewer choices, clearer path"
      steps={[
        { label: "Nine equal options", caption: "All nine look equal, so the user must consider each one before acting." },
        { label: "Advanced hidden", caption: "Rare options move behind a More options link, for people who ask for them." },
        { label: "One obvious step", caption: "One primary action, two quiet ones. The next step needs no thought." },
      ]}
    >
      {({ step }) => {
        const shown = allOptions.filter(({ tier }) => step === 0 || tier < 2);
        return (
          <div className="flex h-60 flex-col rounded-lg bg-fd-muted/50 p-4">
            <div className="grid grid-cols-2 content-start gap-2 sm:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map(({ name, tier }) => (
                  <motion.span
                    layout
                    key={name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "rounded-md px-2 py-2 text-center text-xs font-medium transition-colors",
                      step === 2 && tier === 0
                        ? "col-span-2 bg-blue-600 text-white sm:col-span-3"
                        : "border bg-fd-background",
                      step === 2 && tier === 1 && "text-fd-muted-foreground",
                    )}
                  >
                    {name}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-auto flex items-center justify-between text-xs text-fd-muted-foreground">
              <span className={cn(step === 0 && "invisible")}>More options</span>
              <Badge tone={step === 0 ? "bad" : "good"}>{shown.length} to consider</Badge>
            </p>
          </div>
        );
      }}
    </Scene>
  );
}

const wordings = [
  { label: "Say what happens", prompt: "Delete this chat?", before: "OK", after: "Delete chat" },
  { label: "Use their words", prompt: "Add to your library", before: "Manage embeddings", after: "Upload document" },
  { label: "Keep it short", prompt: "Share this answer", before: "Click here to share this answer with your team", after: "Share" },
];

const wordingBeats = [1400] as const;

export function LabelsDemo() {
  return (
    <Scene
      title="Clear words over clever words"
      steps={wordings.map(({ label, before, after }) => ({ label, caption: `"${before}" becomes "${after}".` }))}
    >
      {(scene) => <LabelsStage {...scene} />}
    </Scene>
  );
}

function LabelsStage({ step, run }: SceneState) {
  const { prompt, before, after } = wordings[step];
  const fixed = useBeats(run, wordingBeats) === 1;

  return (
    <div className="flex h-40 items-center justify-center rounded-lg bg-fd-muted/50 p-4">
      <motion.div layout className="w-full max-w-xs rounded-lg border bg-fd-background p-4 text-sm">
        <p className="font-medium">{prompt}</p>
        <motion.span
          layout
          key={`${run}-${fixed}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-3 inline-block rounded-md px-3 py-1.5 text-xs font-medium text-white",
            fixed ? "bg-blue-600" : "bg-neutral-500",
          )}
        >
          {fixed ? after : before}
        </motion.span>
      </motion.div>
    </div>
  );
}

const dialogBeats = [500, 1100, 1500, 2600] as const;
const undoBeats = [500, 1100, 2000, 2500] as const;

export function UndoDemo() {
  return (
    <Scene
      title="Undo beats Are you sure?"
      steps={[
        { label: "Are you sure?", duration: 4400, caption: "People click through confirmations without reading. The dialog slowed them down and the chat is still gone." },
        { label: "Undo", duration: 4400, caption: "The action happens at once, with a short window to reverse it. Mistakes cost nothing." },
        { label: "Cannot be undone", duration: 4400, caption: "Confirm only actions that cannot be undone, and say exactly what will be lost." },
      ]}
    >
      {(scene) => <UndoStage {...scene} />}
    </Scene>
  );
}

function UndoStage({ step, run }: SceneState) {
  const beat = useBeats(run, step === 1 ? undoBeats : dialogBeats);
  const deleted = step === 0 ? beat >= 3 : step === 1 ? beat >= 2 && beat < 4 : false;
  const dialog = step === 0 ? beat === 2 : step === 2 && beat >= 2;
  const toast = step === 1 && beat >= 2 && beat < 4;
  const target = beat === 0 ? null : beat === 1 ? "delete" : dialog ? "confirm" : toast ? "undo" : null;
  const press = beat === 2 || (step === 1 && beat === 3);

  return (
    <div className="relative h-52 overflow-hidden rounded-lg border bg-fd-background p-3 text-sm">
      <AnimatePresence initial={false} mode="popLayout">
        {["Leave policy questions", "Expense limits"].map((title, index) =>
          index === 0 && deleted ? null : (
            <motion.div
              layout
              key={title}
              exit={{ opacity: 0, x: -40 }}
              className="mb-2 flex items-center justify-between rounded-md border px-3 py-2"
            >
              {title}
              {index === 0 && (
                <span data-target="delete" className="text-fd-muted-foreground">
                  <Trash2 className="size-4" />
                </span>
              )}
            </motion.div>
          ),
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dialog && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-lg border bg-fd-background p-3">
              <p>{step === 0 ? "Are you sure?" : "Delete this chat and its 24 messages? This cannot be undone."}</p>
              <span data-target="confirm" className="mt-2 inline-block rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white">
                {step === 0 ? "OK" : "Delete chat"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.p
            className="absolute right-3 bottom-3 left-3 flex items-center justify-between rounded-md bg-fd-primary px-3 py-2 text-xs text-fd-primary-foreground"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
          >
            Chat deleted
            <span data-target="undo" className="font-semibold underline">
              Undo
            </span>
          </motion.p>
        )}
      </AnimatePresence>
      <Cursor target={target} press={press} />
    </div>
  );
}

const contexts = [
  { icon: FileText, text: "HR policies" },
  { icon: User, text: "Full-time, Singapore" },
];

export function MemoryDemo() {
  return (
    <Scene
      title="Show it, do not make them remember"
      steps={[
        { label: "Hidden context", caption: "Which documents is this answer using? The user has to remember, or go and check." },
        { label: "Visible context", caption: "The conversation, the documents, and the filters stay on screen, so nothing is held in the user's head." },
      ]}
    >
      {({ step }) => {
        const visible = step === 1;
        return (
          <div className="relative h-48 rounded-lg border bg-fd-background p-3 text-sm">
            <div className="flex min-h-7 flex-wrap items-center gap-2">
              <AnimatePresence>
                {visible && (
                  <motion.span
                    className="font-medium"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Leave questions
                  </motion.span>
                )}
                {visible &&
                  contexts.map(({ icon: Icon, text }, index) => (
                    <motion.span
                      key={text}
                      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-fd-muted-foreground"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 + index * 0.2 } }}
                      exit={{ opacity: 0 }}
                    >
                      <Icon className="size-3" />
                      {text}
                    </motion.span>
                  ))}
              </AnimatePresence>
            </div>
            <p className="mt-3">You get 16 weeks of paid parental leave.</p>
            <AnimatePresence>
              {!visible && (
                <motion.p
                  className="absolute right-3 bottom-3 max-w-56 rounded-2xl rounded-br-sm bg-amber-400/20 px-3 py-2 text-xs"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.8 } }}
                  exit={{ opacity: 0 }}
                >
                  Wait, which documents did I select? Is this for my country?
                </motion.p>
              )}
            </AnimatePresence>
            {visible && (
              <motion.p
                className="absolute right-3 bottom-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.9 } }}
              >
                <Badge tone="good">
                  <Check className="size-3" />
                  Nothing to remember
                </Badge>
              </motion.p>
            )}
          </div>
        );
      }}
    </Scene>
  );
}

const taskSteps = ["Open app", "Attach file", "Ask", "Read answer"];
const testers = [0, 1, 2, 3, 4];
const testBeats = [700, 1400, 2100, 3400] as const;

export function UserTestDemo() {
  return (
    <Scene
      title="Five people, one task"
      steps={[
        { label: "Watch", duration: 4600, caption: "Give five people one task, watch, and do not help. Four of them get stuck at the same step." },
        { label: "Fix", duration: 4600, caption: "That step is the problem to fix. After the fix, all five reach the goal." },
      ]}
    >
      {(scene) => <UserTestStage {...scene} />}
    </Scene>
  );
}

function UserTestStage({ step, run }: SceneState) {
  const fixed = step === 1;
  const beat = useBeats(run, testBeats);

  // Everyone advances together, except that four testers stall at the hard step until it is fixed
  const position = (tester: number) => {
    const reach = Math.min(beat, taskSteps.length - 1);
    return !fixed && tester > 0 ? Math.min(reach, 1) : reach;
  };

  return (
    <div className="rounded-lg bg-fd-muted/50 p-4">
      <div className="grid h-44 grid-cols-4 gap-2">
        {taskSteps.map((name, index) => (
          <div
            key={name}
            className={cn(
              "flex flex-col items-center rounded-md border bg-fd-background p-2 transition-colors",
              !fixed && index === 1 && beat >= 3 && "border-fd-error",
            )}
          >
            <span className="text-center text-xs font-medium">{name}</span>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {testers
                .filter((tester) => position(tester) === index)
                .map((tester) => (
                  <motion.span
                    layoutId={`tester-${tester}`}
                    key={tester}
                    className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white"
                  >
                    {!fixed && tester > 0 && index === 1 && beat >= 3 ? "?" : tester + 1}
                  </motion.span>
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center">
        <Badge tone={fixed ? "good" : "neutral"}>
          {testers.filter((tester) => position(tester) === taskSteps.length - 1).length} of 5 reached the goal
        </Badge>
      </p>
    </div>
  );
}
