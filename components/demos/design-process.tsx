"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useCount } from "./scene";

const blocks = [
  { name: "Open", detail: "Header", real: "Policy assistant", color: "#2563eb" },
  { name: "Ask", detail: "Question", real: "How much leave do I get?", color: "#2563eb" },
  { name: "Read", detail: "Answer", real: "16 weeks of paid parental leave.", color: "#e5e7eb" },
  { name: "Follow up", detail: "Input", real: "Ask a follow-up", color: "#f3f4f6" },
];

// Where each block sits, in percent of the stage: left, top, width, height
const flowLayout = [
  [2, 38, 21, 24],
  [27, 38, 21, 24],
  [52, 38, 21, 24],
  [77, 38, 21, 24],
];
const screenLayout = [
  [20, 4, 60, 14],
  [44, 23, 36, 15],
  [20, 43, 60, 30],
  [20, 79, 60, 16],
];

export function FourStepsDemo() {
  return (
    <Scene
      title="One idea, four steps"
      steps={[
        { label: "1. User flow", caption: "A map of steps: what the user is trying to do, and the path that gets them there." },
        { label: "2. Wireframes", caption: "Each step becomes a rough layout: what goes on the screen and where. No color or style." },
        { label: "3. Design system", caption: "The building blocks arrive: colors, type, icons, and components." },
        { label: "4. Design", caption: "The blocks come together into a finished screen with real text." },
      ]}
    >
      {({ step }) => (
        <div className="relative h-72 overflow-hidden rounded-lg bg-fd-muted/50">
          <motion.span
            aria-hidden
            className="absolute top-1/2 right-[10%] left-[10%] h-px bg-fd-foreground/40"
            initial={false}
            animate={{ opacity: step === 0 ? 1 : 0 }}
          />
          {blocks.map(({ name, detail, real, color }, index) => {
            const [left, top, width, height] = (step === 0 ? flowLayout : screenLayout)[index];
            const styled = step >= 2;
            const light = index >= 2;
            return (
              <motion.div
                key={name}
                className="absolute flex items-center justify-center overflow-hidden px-2 text-center text-xs font-medium"
                initial={false}
                animate={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  borderRadius: step === 0 ? 999 : styled ? 10 : 2,
                  backgroundColor: styled ? color : "#ffffff",
                  color: styled && !light ? "#ffffff" : "#1f2937",
                  borderColor: step === 1 ? "#6b7280" : "#d1d5db",
                  borderWidth: 1,
                  borderStyle: step === 1 ? "dashed" : "solid",
                }}
                transition={{ type: "spring", stiffness: 160, damping: 22, delay: index * 0.06 }}
              >
                {step === 0 ? name : step === 3 ? real : detail}
              </motion.div>
            );
          })}
          <AnimatePresence>
            {step === 2 && (
              <motion.div
                className="absolute top-1/2 left-2 flex -translate-y-1/2 flex-col gap-1.5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                {["#2563eb", "#e5e7eb", "#dc2626", "#16a34a"].map((color) => (
                  <span key={color} className="size-5 rounded-full border" style={{ backgroundColor: color }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Scene>
  );
}

const flowSteps = [
  { name: "Open the app", keep: true },
  { name: "Log in again", keep: false },
  { name: "Pick a workspace", keep: false },
  { name: "Pick a model", keep: false },
  { name: "See example questions", keep: true },
  { name: "Ask a question", keep: true },
  { name: "Read the answer", keep: true },
];

export function UserFlowDemo() {
  return (
    <Scene
      title="Find the shortest path"
      steps={[
        { label: "First draft", duration: 5000, caption: "The goal is an answer. Seven steps stand between the user and that goal." },
        { label: "Shortest path", duration: 5000, caption: "Three steps did not help the goal, so they are gone. Every step you remove makes the product easier to use." },
      ]}
    >
      {(scene) => <UserFlowStage {...scene} />}
    </Scene>
  );
}

function UserFlowStage({ step, run }: SceneState) {
  const shown = flowSteps.filter(({ keep }) => step === 0 || keep);
  const reached = useCount(run, shown.length, shown.length * 500, 300);

  return (
    <div className="flex h-44 flex-col justify-between">
      <div className="flex flex-wrap items-center gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map(({ name }, index) => (
            <motion.span
              layout
              key={name}
              exit={{ opacity: 0, scale: 0.6 }}
              className="flex items-center gap-1.5 text-xs"
            >
              <span
                className={cn(
                  "rounded-md border px-2 py-1.5 transition-colors",
                  index < reached ? "border-blue-600 bg-blue-600 text-white" : "bg-fd-background",
                )}
              >
                {name}
              </span>
              {index < shown.length - 1 && <ArrowRight className="size-3 text-fd-muted-foreground" />}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <p>
        <Badge tone={step === 0 ? "bad" : "good"}>{shown.length} steps to the goal</Badge>
      </p>
    </div>
  );
}

const sketches = [
  "grid-cols-[1fr_3fr] grid-rows-[3fr_1fr] [grid-template-areas:'nav_chat'_'nav_input']",
  "grid-cols-[3fr_1fr] grid-rows-[1fr_3fr_1fr] [grid-template-areas:'nav_nav'_'chat_src'_'input_src']",
  "grid-cols-1 grid-rows-[1fr_3fr_1fr] [grid-template-areas:'nav'_'chat'_'input']",
];

const sketchBoxes = [
  { name: "nav", label: "Menu" },
  { name: "chat", label: "Answer" },
  { name: "input", label: "Input" },
  { name: "src", label: "Sources" },
];

export function WireframeDemo() {
  return (
    <Scene
      title="Sketches are cheap"
      steps={[
        { label: "Version 1", duration: 2800, caption: "Boxes for content, labels for buttons. No colors, fonts, or images yet." },
        { label: "Version 2", duration: 2800, caption: "Move a box and you have a new idea. It takes seconds." },
        { label: "Version 3", duration: 2800, caption: "Show the versions to someone and throw most of them away. In a finished design, the same move takes hours." },
      ]}
    >
      {({ step }) => (
        <>
          <div className={cn("grid h-56 gap-2 rounded-lg border-2 border-dashed p-2", sketches[step])}>
            {sketchBoxes
              .filter(({ name }) => name !== "src" || step === 1)
              .map(({ name, label }) => (
                <motion.div
                  layout
                  key={name}
                  style={{ gridArea: name }}
                  className="flex items-center justify-center rounded border border-fd-muted-foreground/50 bg-fd-background text-xs text-fd-muted-foreground"
                >
                  {label}
                </motion.div>
              ))}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-fd-muted-foreground">
            <CostBar label="Move a box in a sketch" width="2%" time="seconds" />
            <CostBar label="Move it in a finished design" width="100%" time="hours" />
          </div>
        </>
      )}
    </Scene>
  );
}

function CostBar({ label, width, time }: { label: string; width: string; time: string }) {
  return (
    <div className="grid grid-cols-[10rem_1fr_auto] items-center gap-2">
      <span>{label}</span>
      <div className="h-2 rounded bg-fd-muted">
        <motion.div className="h-full rounded bg-amber-500" initial={{ width: 0 }} whileInView={{ width }} viewport={{ once: true }} />
      </div>
      <span>{time}</span>
    </div>
  );
}

const systems = [
  { name: "Serious", primary: "#1e3a8a", radius: 2, font: "Georgia, serif", weight: 600 },
  { name: "Playful", primary: "#db2777", radius: 18, font: "ui-rounded, system-ui, sans-serif", weight: 700 },
  { name: "Elegant", primary: "#111827", radius: 8, font: "ui-sans-serif, system-ui, sans-serif", weight: 400 },
];

export function DesignSystemDemo() {
  return (
    <Scene
      title="Change a token, change every screen"
      steps={systems.map(({ name }, index) => ({
        label: name,
        caption: ["A legal tool should look serious.", "A game can look playful, but a legal tool should not.", "Fewer weights and darker tones read as elegant."][index],
      }))}
    >
      {({ step }) => {
        const { primary, radius, font, weight } = systems[step];
        return (
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <dl className="space-y-2 text-xs">
              <Token name="Primary">
                <motion.span className="inline-block size-4 rounded-full" initial={false} animate={{ backgroundColor: primary }} />
              </Token>
              <Token name="Radius">{radius}px</Token>
              <Token name="Weight">{weight}</Token>
              <Token name="Type">{font.split(",")[0]}</Token>
            </dl>
            <div className="grid gap-3 sm:grid-cols-2" style={{ fontFamily: font }}>
              {["Chat", "Documents"].map((screen, index) => (
                <motion.div
                  key={screen}
                  className="flex h-36 flex-col gap-2 border bg-fd-background p-3 text-sm"
                  initial={false}
                  animate={{ borderRadius: radius }}
                >
                  <p style={{ fontWeight: weight }}>{screen}</p>
                  <motion.span className="border px-2 py-1 text-xs text-fd-muted-foreground" initial={false} animate={{ borderRadius: radius }}>
                    {index === 0 ? "Ask a question" : "Search files"}
                  </motion.span>
                  <motion.span
                    className="mt-auto self-end px-3 py-1 text-xs text-white"
                    style={{ fontWeight: weight }}
                    initial={false}
                    animate={{ backgroundColor: primary, borderRadius: radius }}
                  >
                    {index === 0 ? "Send" : "Upload"}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

function Token({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded border bg-fd-background px-2 py-1">
      <dt className="text-fd-muted-foreground">{name}</dt>
      <dd className="flex items-center">{children}</dd>
    </div>
  );
}

const buttonStates = [
  { label: "Default", caption: "Ready to be clicked.", className: "bg-blue-600 text-white" },
  { label: "Hover", caption: "The pointer is on it. A small change says it responds.", className: "bg-blue-700 text-white" },
  { label: "Pressed", caption: "Being clicked. It sinks slightly.", className: "scale-95 bg-blue-800 text-white" },
  { label: "Loading", caption: "Working. It shows progress and blocks a second click.", className: "bg-blue-600 text-white" },
  { label: "Disabled", caption: "Not available yet, and visibly quieter.", className: "bg-fd-muted text-fd-muted-foreground" },
];

export function ComponentStatesDemo() {
  return (
    <Scene
      title="One component, many states"
      steps={buttonStates.map(({ label, caption }) => ({ label, caption, duration: 2200 }))}
    >
      {({ step }) => (
        <div className="flex h-28 items-center justify-center rounded-lg bg-fd-muted/50">
          <span
            className={cn(
              "flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition-all duration-200",
              buttonStates[step].className,
            )}
          >
            {step === 3 && <Loader2 className="size-4 animate-spin" />}
            Send message
          </span>
        </div>
      )}
    </Scene>
  );
}

const principles = [
  "Hierarchy: the answer becomes the biggest thing on screen.",
  "Contrast: faint text becomes readable.",
  "Balance: spacing and edges line up.",
  "Consistency: both buttons now match.",
  "Simplicity: what the user does not need is removed.",
  "Feedback: the click now gets a visible response.",
];

export function PrinciplesDemo() {
  return (
    <Scene
      title="Six principles, one screen"
      steps={[
        { label: "Before", caption: "A real first draft. Nothing is terrible, and nothing is working.", duration: 2800 },
        ...principles.map((caption) => ({ label: caption.split(":")[0], caption, duration: 2800 })),
      ]}
    >
      {({ step }) => {
        const on = (principle: number) => step >= principle;
        return (
          <div className={cn("h-64 rounded-lg border bg-fd-background transition-all duration-500", on(3) ? "p-5" : "p-2")}>
            <motion.p
              layout="position"
              className={cn(
                "transition-all duration-500",
                on(1) ? "text-lg font-semibold" : "text-sm",
                on(2) ? "text-fd-foreground" : "text-neutral-400",
                !on(3) && "ml-3",
              )}
            >
              16 weeks of paid parental leave.
            </motion.p>
            <AnimatePresence initial={false}>
              {!on(5) && (
                <motion.p
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className={cn("overflow-hidden text-sm text-fd-muted-foreground", on(1) ? "" : "font-bold")}
                >
                  Tip: rate this answer! Powered by AI. Version 2.4.
                </motion.p>
              )}
            </AnimatePresence>
            <p className={cn("mt-2 text-sm transition-colors duration-500", on(2) ? "text-fd-muted-foreground" : "text-neutral-300")}>
              Source: Parental Leave Policy, section 2
            </p>
            <div className={cn("mt-4 flex items-center gap-2", on(3) && "mt-6")}>
              <span
                className={cn(
                  "px-3 py-1.5 text-xs font-medium text-white transition-all duration-500",
                  on(4) ? "rounded-md bg-blue-600" : "rounded-full bg-green-600",
                )}
              >
                {on(6) ? "Copied" : "Copy"}
              </span>
              {!on(5) && (
                <span
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium text-white transition-all duration-500",
                    on(4) ? "rounded-md bg-blue-600" : "rounded-none bg-purple-600",
                  )}
                >
                  Share
                </span>
              )}
              {on(6) && <Check className="size-4 text-fd-success" />}
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

export function RealTextDemo() {
  return (
    <Scene
      title="Placeholder text hides problems"
      steps={[
        { label: "Placeholder", caption: "Short, tidy, and fake. Everything fits, so the design looks finished." },
        { label: "Real text", caption: "A real answer runs long and the real button label does not fit. The problems were there all along." },
        { label: "Fixed", caption: "Designed for the real content: the box scrolls and the button label is short." },
      ]}
    >
      {({ step }) => {
        const real = step >= 1;
        const fixed = step === 2;
        return (
          <div className="mx-auto w-full max-w-xs rounded-lg border bg-fd-background p-3 text-sm">
            <div className={cn("h-24 text-sm", fixed ? "overflow-y-auto" : "overflow-visible")}>
              {real
                ? "Full-time employees get 16 weeks of paid parental leave, and part-time employees get leave in proportion to their contracted hours. Tell your manager and HR at least eight weeks before the first block starts."
                : "Lorem ipsum dolor sit amet, consectetur elit."}
            </div>
            <div className="relative z-10 mt-6 flex justify-end">
              <motion.span layout className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white">
                {!real ? "Lorem" : fixed ? "Send to HR" : "Send this request to your HR representative"}
              </motion.span>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

const loopStages = ["User flow", "Wireframes", "Design", "Test"];

export function DesignLoopDemo() {
  return (
    <Scene
      title="Design is a loop"
      steps={[
        ...loopStages.map((label) => ({ label, duration: 1800, caption: "Work moves forward one step at a time." })),
        { label: "Back to the start", duration: 2400, caption: "Testing shows what confuses people, which often sends you back to the flow or the wireframes." },
      ]}
    >
      {({ step }) => (
        <div className="relative mx-auto h-56 max-w-xs">
          <span className="absolute inset-6 rounded-full border-2 border-dashed border-fd-muted-foreground/30" />
          {loopStages.map((label, index) => {
            const angle = (index / 4) * 2 * Math.PI - Math.PI / 2;
            const current = step === index || (step === 4 && index === 0);
            return (
              <motion.span
                key={label}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                  current ? "border-blue-600 bg-blue-600 text-white" : "bg-fd-background",
                )}
                style={{ left: `${50 + 40 * Math.cos(angle)}%`, top: `${50 + 40 * Math.sin(angle)}%` }}
                animate={{ scale: current ? 1.1 : 1 }}
              >
                {label}
              </motion.span>
            );
          })}
        </div>
      )}
    </Scene>
  );
}
