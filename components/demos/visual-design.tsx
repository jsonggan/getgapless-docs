"use client";

import {
  Copy,
  FileText,
  RefreshCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Compare, DemoFrame, Segmented, Slider, Toggle } from "./frame";

export function SpacingDemo() {
  const [padding, setPadding] = useState(12);
  const [margin, setMargin] = useState(12);
  const [xray, setXray] = useState(true);

  const bubbles = [
    "What is our parental leave policy?",
    "Can I split it into two blocks?",
  ];

  return (
    <DemoFrame
      title="Padding and margin"
      controls={
        <>
          <Slider label="Padding" value={padding} min={0} max={32} onChange={setPadding} />
          <Slider label="Margin" value={margin} min={0} max={40} onChange={setMargin} />
          <Toggle label="Show spacing" checked={xray} onChange={setXray} />
        </>
      }
      caption={
        <>
          <strong className="text-fd-foreground">Padding</strong> is space inside an element, between its edge and its content.{" "}
          <strong className="text-fd-foreground">Margin</strong> is space outside it, pushing neighbors away. Set padding to 0 and the
          text touches the edge of the bubble. Set margin to 0 and the messages blur into one.
        </>
      }
    >
      <div className="flex flex-col items-end rounded-lg bg-fd-muted/50 p-4">
        {bubbles.map((text) => (
          <div
            key={text}
            style={{ padding: margin / 2 }}
            className={cn("max-w-xs", xray && "bg-orange-400/30")}
          >
            <div
              style={{ padding }}
              className={cn(
                "rounded-2xl",
                xray ? "bg-green-500/30" : "bg-fd-primary text-fd-primary-foreground",
              )}
            >
              <div className={cn("text-sm", xray && "bg-sky-500/40")}>{text}</div>
            </div>
          </div>
        ))}
      </div>
      {xray && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-fd-muted-foreground">
          <Legend className="bg-orange-400/50" label="Margin" />
          <Legend className="bg-green-500/50" label="Padding" />
          <Legend className="bg-sky-500/50" label="Content" />
        </div>
      )}
    </DemoFrame>
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

const spacingModes = ["Even spacing", "Grouped spacing"] as const;

export function ProximityDemo() {
  const [mode, setMode] = useState<(typeof spacingModes)[number]>("Even spacing");
  const grouped = mode === "Grouped spacing";

  // Grouped: tight inside a field, medium between fields, wide between sections
  const field = grouped ? "gap-1" : "gap-4";
  const fields = grouped ? "gap-3" : "gap-4";
  const sections = grouped ? "gap-8" : "gap-4";

  return (
    <DemoFrame
      title="Spacing creates groups"
      controls={<Segmented options={spacingModes} value={mode} onChange={setMode} />}
      caption="The content is identical in both modes. With even spacing, you have to read every label to work out what belongs together. With grouped spacing, the structure is visible before you read a word."
    >
      <div className={cn("flex max-w-sm flex-col transition-all", sections)}>
        <Section title="Answer style" className={fields}>
          <Field label="Tone" value="Professional" className={field} />
          <Field label="Length" value="Short" className={field} />
        </Section>
        <Section title="Sources" className={fields}>
          <Field label="Search in" value="HR policies" className={field} />
          <Field label="Show citations" value="Always" className={field} />
        </Section>
      </div>
    </DemoFrame>
  );
}

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col transition-all", className)}>
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={cn("flex flex-col transition-all", className)}>
      <span className="text-xs text-fd-muted-foreground">{label}</span>
      <span className="rounded-md border bg-fd-background px-3 py-1.5 text-sm">{value}</span>
    </div>
  );
}

const hierarchyModes = ["Everything loud", "Clear hierarchy"] as const;

export function HierarchyDemo() {
  const [mode, setMode] = useState<(typeof hierarchyModes)[number]>("Everything loud");
  const [blur, setBlur] = useState(false);
  const clear = mode === "Clear hierarchy";

  const actions = [
    { icon: Copy, label: "Copy" },
    { icon: RefreshCw, label: "Regenerate" },
    { icon: ThumbsUp, label: "Helpful" },
    { icon: ThumbsDown, label: "Not helpful" },
    { icon: Share2, label: "Share" },
  ];

  return (
    <DemoFrame
      title="Visual hierarchy"
      controls={
        <>
          <Segmented options={hierarchyModes} value={mode} onChange={setMode} />
          <Toggle label="Blur test" checked={blur} onChange={setBlur} />
        </>
      }
      caption="Turn on the blur test. With everything loud, the buttons win and the answer disappears. With clear hierarchy, the answer still stands out when blurred, because it is the thing the user came for."
    >
      <div className={cn("max-w-lg rounded-xl border bg-fd-background p-4 transition", blur && "blur-[3px]")}>
        {clear ? (
          <>
            <p className="text-base leading-relaxed">
              Full-time employees get 16 weeks of paid parental leave. You can take it in up to two blocks within the
              first year.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-fd-muted-foreground">
              <FileText className="size-3.5" />
              Source: Parental Leave Policy, section 2
            </p>
            <div className="mt-3 flex gap-1">
              {actions.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="rounded-md p-1.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-fd-primary">ANSWER:</p>
            <p className="text-base font-semibold">
              Full-time employees get 16 weeks of paid parental leave. You can take it in up to two blocks within the
              first year.
            </p>
            <p className="mt-2 text-base font-bold">SOURCE: Parental Leave Policy, section 2</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="flex items-center gap-1.5 rounded-md bg-fd-primary px-3 py-1.5 text-sm font-bold text-fd-primary-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </DemoFrame>
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

export function ContrastDemo() {
  const [text, setText] = useState(contrastPresets[0].text);
  const [background, setBackground] = useState(contrastPresets[0].background);
  const ratio = contrastRatio(text, background);

  return (
    <DemoFrame
      title="Contrast checker"
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {contrastPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setText(preset.text);
                  setBackground(preset.background);
                }}
                className="rounded-md border bg-fd-background px-2.5 py-1 text-sm hover:bg-fd-accent"
              >
                {preset.name}
              </button>
            ))}
          </div>
          <ColorInput label="Text" value={text} onChange={setText} />
          <ColorInput label="Background" value={background} onChange={setBackground} />
        </>
      }
      caption="Contrast ratio compares how light the text is with how light its background is. 1:1 is invisible and 21:1 is black on white. Normal text needs at least 4.5:1. Large text (about 24px, or 19px bold) needs at least 3:1."
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-lg border p-5" style={{ color: text, background }}>
          <p className="text-2xl font-semibold">Large heading text</p>
          <p className="mt-2 text-sm">
            Normal body text. Can you read this comfortably? Try it in a bright room or on a phone at low brightness.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2 text-sm">
          <p className="text-3xl font-semibold tabular-nums">{ratio.toFixed(2)}:1</p>
          <Verdict pass={ratio >= 4.5} label="Normal text (4.5:1)" />
          <Verdict pass={ratio >= 3} label="Large text (3:1)" />
        </div>
      </div>
    </DemoFrame>
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
    <p className={cn("font-medium", pass ? "text-fd-success" : "text-fd-error")}>
      {pass ? "✓ Pass" : "✗ Fail"} <span className="font-normal text-fd-muted-foreground">{label}</span>
    </p>
  );
}

export function ColorAloneDemo() {
  const [grayscale, setGrayscale] = useState(false);

  const statuses = [
    { color: "bg-green-500", text: "Indexed", icon: "✓" },
    { color: "bg-amber-500", text: "Processing", icon: "…" },
    { color: "bg-red-500", text: "Failed", icon: "!" },
  ];

  return (
    <DemoFrame
      title="Never rely on color alone"
      controls={<Toggle label="Remove color" checked={grayscale} onChange={setGrayscale} />}
      caption="Turn on Remove color to see roughly what someone with color blindness, or anyone on a washed-out screen, may see. The dots alone become impossible to tell apart. The labeled version still works."
    >
      <div className={cn("transition", grayscale && "grayscale")}>
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
                      className={cn("flex size-4 items-center justify-center rounded-full text-[10px] text-white", status.color)}
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
      </div>
    </DemoFrame>
  );
}

const sampleAnswer =
  "Full-time employees get 16 weeks of paid parental leave, and part-time employees get leave in proportion to their contracted hours. You can take the leave in up to two blocks within the first year after the birth or adoption. Tell your manager and HR at least eight weeks before the first block starts, so the team can plan cover. If your situation changes, you can move the second block once, as long as you give four weeks of notice.";

export function LineLengthDemo() {
  const [width, setWidth] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.6);
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
    <DemoFrame
      title="Line length and line height"
      controls={
        <>
          <Slider label="Width" value={width} min={30} max={100} unit="%" onChange={setWidth} />
          <Slider label="Line height" value={lineHeight} min={1} max={2.2} step={0.1} unit="" onChange={setLineHeight} />
        </>
      }
      caption="Read the paragraph at full width, then narrow it to around 70 characters. Long lines make it hard to find the start of the next line. Tight line height makes lines blur together."
    >
      <p className={cn("mb-3 text-sm font-medium", verdict.tone)}>
        About {perLine} characters per line. {verdict.label}
      </p>
      <div ref={boxRef} style={{ width: `${width}%`, lineHeight }} className="text-sm transition-all">
        {sampleAnswer}
      </div>
      <span ref={sampleRef} aria-hidden className="invisible absolute whitespace-nowrap text-sm">
        {sampleAnswer.slice(0, 120)}
      </span>
    </DemoFrame>
  );
}
