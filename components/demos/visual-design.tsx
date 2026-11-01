"use client";

import { Copy, FileText, RefreshCw, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Compare, Slider, Toggle } from "./frame";
import { Badge, Rolling, Scene, type SceneState, Stack, useCount } from "./scene";

const sampleAnswer =
  "Full-time employees get 16 weeks of paid parental leave, and part-time employees get leave in proportion to their contracted hours. You can take the leave in up to two blocks within the first year after the birth or adoption. Tell your manager and HR at least eight weeks before the first block starts, so the team can plan cover. If your situation changes, you can move the second block once, as long as you give four weeks of notice.";

const gazePaths = [
  [
    [14, 12],
    [72, 18],
    [32, 36],
    [84, 44],
    [20, 58],
    [62, 70],
    [38, 86],
  ],
  [
    [24, 22],
    [42, 54],
    [20, 84],
  ],
];

export function ScanDemo() {
  return (
    <Scene
      title="Users scan, they do not read"
      steps={[
        {
          label: "Wall of text",
          duration: 4200,
          caption: "Each circle is a place the eye stops. With no structure, the eye hunts across the whole screen.",
        },
        {
          label: "Clear structure",
          duration: 4200,
          caption: "Same content. The eye goes to the heading, then the answer, then the one action, and it is done.",
        },
      ]}
    >
      {(scene) => <ScanStage {...scene} />}
    </Scene>
  );
}

function ScanStage({ step, run }: SceneState) {
  const path = gazePaths[step];
  const seen = useCount(run, path.length, 2400, 300);

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border bg-fd-background">
        <Stack active={step}>
          <p className="h-64 p-4 text-sm leading-relaxed">{sampleAnswer}</p>
          <div className="h-64 p-4">
            <p className="text-lg font-semibold">16 weeks of paid leave</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-fd-muted-foreground">
              Full-time employees get 16 weeks. You can take it in up to two blocks within the first year.
            </p>
            <span className="mt-6 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
              Read the full policy
            </span>
          </div>
        </Stack>
        {path.slice(0, seen).map(([x, y], index) => (
          <motion.span
            key={`${step}-${x}-${y}`}
            className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400/80 text-xs font-semibold text-neutral-950"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {index + 1}
          </motion.span>
        ))}
      </div>
      <p className="mt-3">
        <Badge tone={step === 0 ? "bad" : "good"}>
          {seen} {seen === 1 ? "stop" : "stops"} to find the answer
        </Badge>
      </p>
    </>
  );
}

const actions = [
  { icon: Copy, label: "Copy" },
  { icon: RefreshCw, label: "Regenerate" },
  { icon: ThumbsUp, label: "Helpful" },
  { icon: ThumbsDown, label: "Not helpful" },
  { icon: Share2, label: "Share" },
];

export function HierarchyDemo() {
  return (
    <Scene
      title="Visual hierarchy"
      steps={[
        { label: "Everything loud", caption: "Bold labels, bold text, and five bold buttons all fight for attention." },
        { label: "Blur test", caption: "Blurred, the buttons win and the answer disappears." },
        { label: "Clear hierarchy", caption: "One thing is big. The source is quiet. The controls are small and muted." },
        { label: "Blur test again", caption: "Blurred, the answer still stands out, because it is what the user came for." },
      ]}
    >
      {({ step }) => {
        const clear = step >= 2;
        const blurred = step % 2 === 1;
        return (
          <motion.div
            className="min-h-[25rem] max-w-lg rounded-xl border sm:min-h-72 bg-fd-background p-4"
            animate={{ filter: blurred ? "blur(3px)" : "blur(0px)" }}
          >
            <motion.p
              className="overflow-hidden font-bold text-fd-primary"
              initial={false}
              animate={{ height: clear ? 0 : 28, opacity: clear ? 0 : 1 }}
            >
              ANSWER:
            </motion.p>
            <p className={cn("leading-relaxed transition-all", !clear && "font-semibold")}>
              Full-time employees get 16 weeks of paid parental leave. You can take it in up to two blocks within the
              first year.
            </p>
            <p
              className={cn(
                "mt-3 flex items-center gap-1.5 transition-all",
                clear ? "text-xs text-fd-muted-foreground" : "text-base font-bold",
              )}
            >
              <FileText className="size-3.5" />
              Source: Parental Leave Policy, section 2
            </p>
            <div className={cn("mt-3 flex min-h-20 flex-wrap content-start", clear ? "gap-1" : "gap-2")}>
              {actions.map(({ icon: Icon, label }) => (
                <motion.span
                  layout
                  key={label}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md text-sm font-bold",
                    clear ? "p-1.5 text-fd-muted-foreground" : "bg-fd-primary px-3 py-1.5 text-fd-primary-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {!clear && label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        );
      }}
    </Scene>
  );
}

const spacingPresets = [
  { padding: 12, margin: 12 },
  { padding: 0, margin: 12 },
  { padding: 12, margin: 0 },
  { padding: 28, margin: 36 },
];

export function SpacingDemo() {
  const [manual, setManual] = useState<{ step: number; padding: number; margin: number } | null>(null);
  const [xray, setXray] = useState(true);

  const bubbles = ["What is our parental leave policy?", "Can I split it into two blocks?"];
  const values = (step: number) => (manual?.step === step ? manual : spacingPresets[step]);

  return (
    <Scene
      title="Padding and margin"
      steps={[
        {
          label: "Balanced",
          caption: (
            <>
              <strong className="text-fd-foreground">Padding</strong> is space inside an element.{" "}
              <strong className="text-fd-foreground">Margin</strong> is space outside it, pushing neighbors away.
            </>
          ),
        },
        { label: "No padding", caption: "With no padding, the text touches the edge of the bubble." },
        { label: "No margin", caption: "With no margin, the two messages blur into one." },
        { label: "Too much", caption: "With too much space, the messages stop looking like one conversation." },
      ]}
      controls={({ step, stop }) => {
        const { padding, margin } = values(step);
        return (
          <>
            <Slider
              label="Padding"
              value={padding}
              min={0}
              max={32}
              onChange={(value) => {
                stop();
                setManual({ step, padding: value, margin });
              }}
            />
            <Slider
              label="Margin"
              value={margin}
              min={0}
              max={40}
              onChange={(value) => {
                stop();
                setManual({ step, padding, margin: value });
              }}
            />
            <Toggle label="Show spacing" checked={xray} onChange={setXray} />
          </>
        );
      }}
    >
      {({ step }) => {
        const { padding, margin } = values(step);
        return (
          <>
            <div className="flex h-64 flex-col items-end justify-center rounded-lg bg-fd-muted/50 p-4">
              {bubbles.map((text) => (
                <motion.div
                  key={text}
                  initial={false}
                  animate={{ padding: margin / 2 }}
                  className={cn("max-w-xs", xray && "bg-orange-400/30")}
                >
                  <motion.div
                    initial={false}
                    animate={{ padding }}
                    className={cn(
                      "rounded-2xl",
                      xray ? "bg-green-500/30" : "bg-fd-primary text-fd-primary-foreground",
                    )}
                  >
                    <div className={cn("text-sm", xray && "bg-sky-500/40")}>{text}</div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <div className={cn("mt-3 flex flex-wrap gap-4 text-xs text-fd-muted-foreground", !xray && "invisible")}>
              <Legend className="bg-orange-400/50" label="Margin" />
              <Legend className="bg-green-500/50" label="Padding" />
              <Legend className="bg-sky-500/50" label="Content" />
            </div>
          </>
        );
      }}
    </Scene>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded-sm", className)} />
      {label}
    </span>
  );
}

export function ProximityDemo() {
  return (
    <Scene
      title="Spacing creates groups"
      steps={[
        { label: "Even spacing", caption: "Everything is the same distance apart, so you must read every label to see what belongs together." },
        { label: "Grouped spacing", caption: "Same content. Tight inside a field, wider between fields, widest between sections. The structure shows before you read." },
      ]}
    >
      {({ step }) => {
        const grouped = step === 1;
        // Grouped: tight inside a field, medium between fields, wide between sections
        const field = grouped ? "gap-1" : "gap-4";
        const fields = grouped ? "gap-3" : "gap-4";
        return (
          <div className={cn("flex min-h-96 max-w-sm flex-col transition-all duration-500", grouped ? "gap-8" : "gap-4")}>
            <Section title="Answer style" className={fields} grouped={grouped}>
              <Field label="Tone" value="Professional" className={field} />
              <Field label="Length" value="Short" className={field} />
            </Section>
            <Section title="Sources" className={fields} grouped={grouped}>
              <Field label="Search in" value="HR policies" className={field} />
              <Field label="Show citations" value="Always" className={field} />
            </Section>
          </div>
        );
      }}
    </Scene>
  );
}

function Section({
  title,
  className,
  grouped,
  children,
}: {
  title: string;
  className: string;
  grouped: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative flex flex-col transition-all duration-500", className)}>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-lg border-2 border-dashed border-fd-primary/40"
        initial={false}
        animate={{ opacity: grouped ? 1 : 0, scale: grouped ? 1 : 1.03 }}
      />
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={cn("flex flex-col transition-all duration-500", className)}>
      <span className="text-xs text-fd-muted-foreground">{label}</span>
      <span className="rounded-md border bg-fd-background px-3 py-1.5 text-sm">{value}</span>
    </div>
  );
}

const rows = [
  { label: "Tone", offset: 0, gap: 0 },
  { label: "Length", offset: 9, gap: 7 },
  { label: "Search in", offset: -6, gap: 23 },
  { label: "Citations", offset: 4, gap: 12 },
];

export function AlignmentDemo() {
  return (
    <Scene
      title="Shared edges and a spacing scale"
      steps={[
        {
          label: "Almost aligned",
          caption: "Each row is a few pixels off, and the gaps are 7, 23, and 12. Nothing is badly wrong, but it looks like a mistake.",
        },
        {
          label: "On the grid",
          caption: "Every row sits on one shared edge, and every gap is 16. The same content now feels calm and deliberate.",
        },
      ]}
    >
      {({ step }) => {
        const snapped = step === 1;
        return (
          <div className="relative mx-auto h-72 max-w-xs pl-6">
            <motion.span
              aria-hidden
              className="absolute top-0 bottom-0 left-6 w-px origin-top bg-blue-500"
              initial={false}
              animate={{ scaleY: snapped ? 1 : 0 }}
            />
            {rows.map(({ label, offset, gap }, index) => {
              const size = snapped ? (index === 0 ? 0 : 16) : gap;
              return (
                <motion.div key={label} initial={false} animate={{ marginTop: size }} className="relative">
                  {index > 0 && (
                    <span className="absolute -top-2 -left-6 w-6 text-right text-[10px] leading-none text-fd-muted-foreground tabular-nums">
                      {size}
                    </span>
                  )}
                  <motion.div
                    initial={false}
                    animate={{ x: snapped ? 0 : offset }}
                    className="rounded-md border bg-fd-background px-3 py-2 text-sm"
                  >
                    {label}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        );
      }}
    </Scene>
  );
}

const typeStyles = [
  [
    "font-serif text-2xl italic",
    "font-mono text-lg font-bold",
    "font-serif text-[15px] underline",
    "font-mono text-[11px] uppercase",
  ],
  [
    "font-sans text-base font-bold uppercase underline",
    "font-sans text-sm font-bold uppercase underline",
    "font-sans text-sm uppercase",
    "font-sans text-xs uppercase",
  ],
  [
    "font-sans text-2xl font-semibold",
    "font-sans text-base font-semibold",
    "font-sans text-sm",
    "font-sans text-xs text-fd-muted-foreground",
  ],
];

const typeSample = [
  "Parental leave",
  "How much leave do I get?",
  "Full-time employees get 16 weeks of paid leave.",
  "Updated in March",
];

export function TypeScaleDemo() {
  return (
    <Scene
      title="Fewer type styles"
      steps={[
        { label: "Too many styles", caption: "Two typefaces fighting, with italics, underlines, and capitals. Every line asks for a different kind of attention." },
        { label: "Capitals everywhere", caption: "One typeface helps, but capitals and underlines make all text the same shape and slow reading." },
        { label: "Size and weight", caption: "One typeface and three sizes. Size and weight do all the work, so levels are clear at a glance." },
      ]}
    >
      {({ step }) => (
        <div className="flex h-44 flex-col justify-center gap-2 rounded-lg border bg-fd-background p-5">
          {typeSample.map((text, index) => (
            <motion.p layout="position" key={text} className={typeStyles[step][index]}>
              {text}
            </motion.p>
          ))}
        </div>
      )}
    </Scene>
  );
}

const linePresets = [
  { width: 100, lineHeight: 1.6 },
  { width: 34, lineHeight: 1.6 },
  { width: 70, lineHeight: 1.05 },
  { width: 70, lineHeight: 1.6 },
];

export function LineLengthDemo() {
  const [manual, setManual] = useState<{ step: number; width: number; lineHeight: number } | null>(null);
  const values = (step: number) => (manual?.step === step ? manual : linePresets[step]);

  return (
    <Scene
      title="Line length and line height"
      steps={[
        { label: "Too wide", caption: "Long lines make it hard to find the start of the next line." },
        { label: "Too narrow", caption: "Very short lines break the reading rhythm, and your eyes jump back constantly." },
        { label: "Too tight", caption: "Tight line height makes the lines blur together." },
        { label: "Comfortable", caption: "Around 70 characters per line with room to breathe. This is the target for long AI answers." },
      ]}
      controls={({ step, stop }) => {
        const { width, lineHeight } = values(step);
        return (
          <>
            <Slider
              label="Width"
              value={width}
              min={30}
              max={100}
              unit="%"
              onChange={(value) => {
                stop();
                setManual({ step, width: value, lineHeight });
              }}
            />
            <Slider
              label="Line height"
              value={lineHeight}
              min={1}
              max={2.2}
              step={0.05}
              unit=""
              onChange={(value) => {
                stop();
                setManual({ step, width, lineHeight: value });
              }}
            />
          </>
        );
      }}
    >
      {({ step }) => <LineLengthStage {...values(step)} />}
    </Scene>
  );
}

function LineLengthStage({ width, lineHeight }: { width: number; lineHeight: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const sampleRef = useRef<HTMLSpanElement>(null);
  const [perLine, setPerLine] = useState(0);

  // Measure average character width, then estimate characters per line
  useEffect(() => {
    const box = boxRef.current;
    const sample = sampleRef.current;
    if (!box || !sample) return;
    const measure = () => {
      const charWidth = sample.offsetWidth / sample.textContent!.length;
      setPerLine(Math.round(box.clientWidth / charWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const verdict =
    perLine < 45
      ? { label: "Too short: your eyes jump to the next line too often", tone: "text-fd-warning" }
      : perLine <= 80
        ? { label: "Comfortable", tone: "text-fd-success" }
        : { label: "Too long: easy to lose your place between lines", tone: "text-fd-error" };

  return (
    <>
      <p className={cn("mb-3 min-h-10 text-sm font-medium sm:min-h-0", verdict.tone)}>
        About {perLine} characters per line. {verdict.label}
      </p>
      <div className="relative h-[23rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_88%,transparent)]">
        <motion.div
          ref={boxRef}
          initial={false}
          animate={{ width: `${width}%`, lineHeight }}
          className="text-sm"
        >
          {sampleAnswer}
        </motion.div>
      </div>
      <span ref={sampleRef} aria-hidden className="invisible absolute whitespace-nowrap text-sm">
        {sampleAnswer.slice(0, 120)}
      </span>
    </>
  );
}

const colorJobs = [
  { label: "Save", colors: ["#ec4899", "#2563eb", "#2563eb"] },
  { label: "Delete", colors: ["#14b8a6", "#2563eb", "#dc2626"] },
  { label: "Share", colors: ["#f59e0b", "#2563eb", "#00000000"] },
  { label: "Export", colors: ["#8b5cf6", "#2563eb", "#00000000"] },
];

export function ColorMeaningDemo() {
  return (
    <Scene
      title="Color carries meaning"
      steps={[
        { label: "Decoration", caption: "Four colors with no meaning. Nothing tells the user which button matters, or which one is dangerous." },
        { label: "All the same", caption: "Now Save and Delete look identical, so a slip costs the user their work." },
        { label: "Meaning", caption: "One accent color for the main action, red for destruction, and quiet outlines for the rest." },
      ]}
    >
      {({ step }) => (
        <div className="flex h-32 flex-wrap content-center items-center justify-center gap-3 rounded-lg bg-fd-muted/50 p-4">
          {colorJobs.map(({ label, colors }) => {
            const quiet = colors[step] === "#00000000";
            return (
              <motion.span
                key={label}
                initial={false}
                animate={{
                  backgroundColor: colors[step],
                  scale: step === 2 && label === "Save" ? 1.08 : 1,
                }}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  quiet ? "text-fd-muted-foreground" : "border-transparent text-white",
                )}
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

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const contrastPresets = [
  { name: "Light gray", text: "#b0b0b0", background: "#ffffff" },
  { name: "Mid gray", text: "#767676", background: "#ffffff" },
  { name: "Near black", text: "#1f2937", background: "#ffffff" },
  { name: "Blue on navy", text: "#3b82f6", background: "#1e293b" },
];

const formatRatio = (value: number) => `${value.toFixed(2)}:1`;

// Places a ratio on a log scale, since 1:1 to 21:1 is the full range
const ratioPosition = (ratio: number) => Math.round((Math.log(ratio) / Math.log(21)) * 10000) / 100;

export function ContrastDemo() {
  const [manual, setManual] = useState<{ step: number; text: string; background: string } | null>(null);
  const values = (step: number) => (manual?.step === step ? manual : contrastPresets[step]);

  return (
    <Scene
      title="Contrast checker"
      steps={[
        { label: "Light gray", caption: "Popular in designs, but too faint. It fails for normal text and for large text." },
        { label: "Mid gray", caption: "#767676 on white just passes 4.5:1, the minimum for normal text." },
        { label: "Near black", caption: "Comfortable in a bright room and on a dim phone. 21:1 is black on white." },
        { label: "Blue on navy", caption: "Bright colors can still fail. Large text needs 3:1, normal text needs 4.5:1." },
      ]}
      controls={({ step, stop }) => {
        const { text, background } = values(step);
        return (
          <>
            <ColorInput
              label="Text"
              value={text}
              onChange={(value) => {
                stop();
                setManual({ step, text: value, background });
              }}
            />
            <ColorInput
              label="Background"
              value={background}
              onChange={(value) => {
                stop();
                setManual({ step, text, background: value });
              }}
            />
          </>
        );
      }}
    >
      {({ step }) => {
        const { text, background } = values(step);
        const ratio = contrastRatio(text, background);
        return (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <motion.div
                className="rounded-lg border p-5"
                initial={false}
                animate={{ color: text, backgroundColor: background }}
              >
                <p className="text-2xl font-semibold">Large heading text</p>
                <p className="mt-2 text-sm">
                  Normal body text. Can you read this comfortably? Try it on a phone at low brightness.
                </p>
              </motion.div>
              <div className="flex flex-col justify-center gap-2 text-sm">
                <p className="text-3xl font-semibold">
                  <Rolling value={ratio} format={formatRatio} />
                </p>
                <Verdict pass={ratio >= 4.5} label="Normal text (4.5:1)" />
                <Verdict pass={ratio >= 3} label="Large text (3:1)" />
              </div>
            </div>
            <div className="relative mt-6 mb-5 h-2 rounded-full bg-fd-muted">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-fd-primary"
                initial={false}
                animate={{ width: `${ratioPosition(ratio)}%` }}
              />
              {[3, 4.5].map((mark) => (
                <span
                  key={mark}
                  className="absolute -top-1 h-4 w-px bg-fd-foreground"
                  style={{ left: `${ratioPosition(mark)}%` }}
                >
                  <span className="absolute top-5 -translate-x-1/2 text-xs text-fd-muted-foreground">{mark}:1</span>
                </span>
              ))}
            </div>
          </>
        );
      }}
    </Scene>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-fd-muted-foreground">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 cursor-pointer rounded border bg-transparent"
      />
    </label>
  );
}

function Verdict({ pass, label }: { pass: boolean; label: string }) {
  return (
    <p className={cn("font-medium transition-colors", pass ? "text-fd-success" : "text-fd-error")}>
      {pass ? "✓ Pass" : "✗ Fail"} <span className="font-normal text-fd-muted-foreground">{label}</span>
    </p>
  );
}

const statuses = [
  { color: "bg-green-500", text: "Indexed", icon: "✓" },
  { color: "bg-amber-500", text: "Processing", icon: "…" },
  { color: "bg-red-500", text: "Failed", icon: "!" },
];

export function ColorAloneDemo() {
  return (
    <Scene
      title="Never rely on color alone"
      steps={[
        { label: "In color", caption: "With full color vision, both lists work." },
        {
          label: "Color removed",
          caption: "This is roughly what someone with color blindness, or anyone on a washed-out screen, may see. The dots become impossible to tell apart. The labeled version still works.",
        },
      ]}
    >
      {({ step }) => (
        <motion.div initial={false} animate={{ filter: step === 1 ? "grayscale(1)" : "grayscale(0)" }}>
          <Compare
            badLabel="Color only"
            goodLabel="Color, icon, and text"
            bad={
              <ul className="flex flex-col gap-2 text-sm">
                {statuses.map((status, i) => (
                  <li key={status.text} className="flex items-center gap-2 rounded-md border bg-fd-background px-3 py-2">
                    <span className={cn("size-2.5 rounded-full", status.color)} />
                    handbook-{i + 1}.pdf
                  </li>
                ))}
              </ul>
            }
            good={
              <ul className="flex flex-col gap-2 text-sm">
                {statuses.map((status, i) => (
                  <li
                    key={status.text}
                    className="flex items-center justify-between gap-2 rounded-md border bg-fd-background px-3 py-2"
                  >
                    handbook-{i + 1}.pdf
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full text-[10px] text-white",
                          status.color,
                        )}
                      >
                        {status.icon}
                      </span>
                      {status.text}
                    </span>
                  </li>
                ))}
              </ul>
            }
          />
        </motion.div>
      )}
    </Scene>
  );
}

const themes = [
  { background: "#ffffff", text: "#1f2937", accent: "#1d4ed8" },
  { background: "#0f172a", text: "#1f2937", accent: "#1d4ed8" },
  { background: "#0f172a", text: "#e5e7eb", accent: "#93c5fd" },
];

const formatPlain = (value: number) => value.toFixed(1);

export function ThemeDemo() {
  return (
    <Scene
      title="Check both themes"
      steps={[
        { label: "Light mode", caption: "Dark text and a deep blue link read well on white." },
        { label: "Dark mode, same colors", caption: "Flip only the background and the same colors disappear." },
        { label: "Dark mode, adjusted", caption: "Each color needs its own dark version, chosen for the dark background." },
      ]}
    >
      {({ step }) => {
        const { background, text, accent } = themes[step];
        const ratio = contrastRatio(text, background);
        return (
          <>
            <motion.div
              className="rounded-lg border p-5"
              initial={false}
              animate={{ backgroundColor: background, color: text }}
            >
              <p className="font-semibold">Parental leave</p>
              <p className="mt-1 text-sm">Full-time employees get 16 weeks of paid leave.</p>
              <motion.p className="mt-2 text-sm underline" initial={false} animate={{ color: accent }}>
                Read the full policy
              </motion.p>
            </motion.div>
            <p className="mt-3 text-sm text-fd-muted-foreground">
              Text contrast: <Rolling value={ratio} format={formatPlain} />
              :1 <Badge tone={ratio >= 4.5 ? "good" : "bad"}>{ratio >= 4.5 ? "Readable" : "Unreadable"}</Badge>
            </p>
          </>
        );
      }}
    </Scene>
  );
}

const consistencyScreens = [
  { name: "Chat", label: "Send", messy: "self-start rounded-full bg-green-600 px-5" },
  { name: "Documents", label: "Upload", messy: "self-center rounded-none bg-orange-600 px-2" },
  { name: "Settings", label: "Save", messy: "self-end rounded-md bg-purple-600 px-8 uppercase" },
];

export function ConsistencyDemo() {
  return (
    <Scene
      title="Learn it once"
      steps={[
        { label: "Every screen differs", caption: "All three do the same job, but users must relearn what the main action looks like on each screen." },
        { label: "One button", caption: "One shape, one color, one position. Once users learn it on one screen, they know it on all of them." },
      ]}
    >
      {({ step }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          {consistencyScreens.map(({ name, label, messy }) => (
            <div key={name} className="flex h-36 flex-col rounded-lg border bg-fd-background p-3">
              <p className="text-xs font-medium text-fd-muted-foreground">{name}</p>
              <div className="mt-2 space-y-1.5">
                <div className="h-2 rounded bg-fd-muted" />
                <div className="h-2 w-2/3 rounded bg-fd-muted" />
              </div>
              <motion.span
                layout
                className={cn(
                  "mt-auto py-1.5 text-center text-sm font-medium text-white",
                  step === 0 ? messy : "self-end rounded-md bg-blue-600 px-4",
                )}
              >
                {label}
              </motion.span>
            </div>
          ))}
        </div>
      )}
    </Scene>
  );
}
