"use client";

import { MousePointer2, Pause, Play } from "lucide-react";
import { MotionConfig, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Children, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DemoFrame } from "./frame";

export const spring = { type: "spring", stiffness: 220, damping: 26 } as const;

const defaultDuration = 3600;

export type SceneStep = {
  label: string;
  caption: ReactNode;
  duration?: number;
};

export type SceneState = {
  step: number;
  // Bumps every time a step starts, so timed animations inside a scene restart
  run: number;
  stop: () => void;
};

// Auto-playing demo: loops through its steps while on screen, and hands over to the reader on any click
export function Scene({
  title,
  steps,
  controls,
  children,
}: {
  title: string;
  steps: SceneStep[];
  controls?: (scene: SceneState) => ReactNode;
  children: (scene: SceneState) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [position, setPosition] = useState({ step: 0, run: 0 });
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);

  const { step, run } = position;
  const count = steps.length;
  const duration = steps[step].duration ?? defaultDuration;
  const active = playing && visible && !reduced;

  const stop = useCallback(() => setPlaying(false), []);
  const restart = useCallback(() => setPosition((p) => ({ step: p.step, run: p.run + 1 })), []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) restart();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [restart]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: position restarts the timer on every step
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      setPosition((p) => ({ step: (p.step + 1) % count, run: p.run + 1 }));
    }, duration);
    return () => clearTimeout(timer);
  }, [active, count, duration, position]);

  const scene = { step, run, stop };

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <div ref={ref}>
        <DemoFrame
          title={title}
          action={
            <button
              type="button"
              aria-label={active ? "Pause animation" : "Play animation"}
              onClick={() => {
                if (!playing) restart();
                setPlaying(!playing);
              }}
              className="rounded-md border bg-fd-background p-1.5 text-fd-muted-foreground hover:text-fd-foreground"
            >
              {active ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
          }
          controls={
            count > 1 || controls ? (
              <>
                {count > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {steps.map((item, index) => (
                      <button
                        key={item.label}
                        type="button"
                        aria-pressed={index === step}
                        onClick={() => {
                          setPosition((p) => ({ step: index, run: p.run + 1 }));
                          stop();
                        }}
                        className={cn(
                          "relative overflow-hidden rounded-md border px-2.5 py-1 text-sm transition-colors",
                          index === step
                            ? "border-fd-primary bg-fd-background text-fd-foreground"
                            : "bg-fd-background/50 text-fd-muted-foreground hover:text-fd-foreground",
                        )}
                      >
                        {index === step && active && (
                          <motion.span
                            key={run}
                            aria-hidden
                            className="absolute inset-0 origin-left bg-fd-primary/15"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: duration / 1000, ease: "linear" }}
                          />
                        )}
                        <span className="relative">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {controls?.(scene)}
              </>
            ) : undefined
          }
          caption={
            <Stack active={step}>
              {steps.map((item) => (
                <span key={item.label}>{item.caption}</span>
              ))}
            </Stack>
          }
        >
          {children(scene)}
        </DemoFrame>
      </div>
    </MotionConfig>
  );
}

// Stacks every variant in one grid cell, so the box keeps the height of the tallest and the page never jumps
export function Stack({
  active,
  className,
  children,
}: {
  active: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid", className)}>
      {Children.map(children, (child, index) => (
        <motion.div
          className={cn("col-start-1 row-start-1 min-w-0", index !== active && "pointer-events-none")}
          aria-hidden={index !== active}
          initial={false}
          animate={index === active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Returns how many of the given millisecond marks have passed since the step started
export function useBeats(run: number, times: readonly number[]) {
  const reduced = useReducedMotion();
  const [state, setState] = useState({ run: 0, beat: 0 });

  useEffect(() => {
    if (run === 0) return;
    const timers = times.map((time, index) => setTimeout(() => setState({ run, beat: index + 1 }), time));
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [run, times]);

  if (reduced && run > 0) return times.length;
  return state.run === run ? state.beat : 0;
}

// Counts from 0 to total over the given time, for streaming text and clocks
export function useCount(run: number, total: number, duration: number, delay = 0) {
  const reduced = useReducedMotion();
  const [state, setState] = useState({ run: 0, count: 0 });

  useEffect(() => {
    if (run === 0) return;
    let count = 0;
    let interval: ReturnType<typeof setInterval>;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        count += 1;
        setState({ run, count });
        if (count >= total) clearInterval(interval);
      }, duration / total);
    }, delay);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [run, total, duration, delay]);

  if (reduced && run > 0) return total;
  return state.run === run ? state.count : 0;
}

// Fake pointer that glides to the element marked data-target="..." inside the nearest relative parent
export function Cursor({ target, press = false }: { target: string | null; press?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState({ x: 24, y: 24 });

  useEffect(() => {
    const stage = ref.current?.parentElement;
    if (!stage) return;
    const measure = () => {
      const bounds = stage.getBoundingClientRect();
      const element = target && stage.querySelector(`[data-target="${target}"]`);
      if (!element) {
        setPoint({ x: bounds.width * 0.82, y: bounds.height * 0.86 });
        return;
      }
      const box = element.getBoundingClientRect();
      setPoint({ x: box.left - bounds.left + box.width / 2, y: box.top - bounds.top + box.height / 2 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [target]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20"
      initial={false}
      animate={point}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
    >
      {press && (
        <motion.span
          className="absolute -top-3 -left-3 size-6 rounded-full border-2 border-fd-primary"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <motion.div animate={{ scale: press ? 0.8 : 1 }}>
        <MousePointer2 className="size-5 fill-fd-foreground stroke-fd-background drop-shadow" />
      </motion.div>
    </motion.div>
  );
}

// Number that rolls to its new value instead of jumping
export function Rolling({ value, format }: { value: number; format: (value: number) => string }) {
  const motionValue = useSpring(value, { stiffness: 120, damping: 20 });
  const text = useTransform(motionValue, format);

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}

// Small tag that pops in, used for verdicts such as "7 stops" or "Pass"
export function Badge({ tone, children }: { tone: "good" | "bad" | "neutral"; children: ReactNode }) {
  return (
    <motion.span
      key={String(children)}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "good" && "bg-fd-success/15 text-fd-success",
        tone === "bad" && "bg-fd-error/15 text-fd-error",
        tone === "neutral" && "bg-fd-muted text-fd-muted-foreground",
      )}
    >
      {children}
    </motion.span>
  );
}
