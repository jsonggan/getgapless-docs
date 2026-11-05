"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useCount } from "./scene";

// Example scores: five runs of the same, unchanged version, and three runs of a version that really got worse
const baseline = 0.84;
const unchanged = [0.836, 0.848, 0.822, 0.843, 0.827];
const regressed = [0.795, 0.788, 0.801];
const axis = { min: 0.76, max: 0.88 };

const cases = [
  {
    label: "max_drop 0.01",
    maxDrop: 0.01,
    runs: unchanged,
    changed: false,
    caption:
      "Five runs of the same code spread over about 0.03. With a limit of 0.01, two of them fail the gate although nothing changed. People soon learn to ignore the gate.",
  },
  {
    label: "max_drop 0.03",
    maxDrop: 0.03,
    runs: unchanged,
    changed: false,
    caption: "With the limit set above the measured spread, every run of the unchanged code passes.",
  },
  {
    label: "Real regression",
    maxDrop: 0.03,
    runs: regressed,
    changed: true,
    caption: "A change that really lowers quality lands below the line on every run, so the same gate still catches it.",
  },
];

const position = (score: number) => ((score - axis.min) / (axis.max - axis.min)) * 100;

export function EvalNoiseDemo() {
  return (
    <Scene title="Gates and run-to-run noise" steps={cases.map(({ label, caption }) => ({ label, caption, duration: 4600 }))}>
      {(scene) => <NoiseStage {...scene} />}
    </Scene>
  );
}

function NoiseStage({ step, run }: SceneState) {
  const { maxDrop, runs, changed } = cases[step];
  const threshold = baseline - maxDrop;
  const shown = useCount(run, runs.length, 2000, 300);
  const visible = runs.slice(0, shown);
  const failed = visible.filter((score) => score < threshold).length;

  return (
    <div className="space-y-4 text-sm">
      <div className="relative h-24 rounded-lg border bg-fd-background">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-l-lg bg-fd-error/10"
          initial={false}
          animate={{ width: `${position(threshold)}%` }}
        />
        <motion.div className="absolute inset-y-0 w-0.5 bg-fd-error" initial={false} animate={{ left: `${position(threshold)}%` }}>
          <span className="absolute top-1 left-1.5 whitespace-nowrap text-[10px] text-fd-error">gate {threshold.toFixed(2)}</span>
        </motion.div>
        <div className="absolute inset-y-0 w-px border-l border-dashed border-fd-foreground/50" style={{ left: `${position(baseline)}%` }}>
          <span className="absolute bottom-1 left-1.5 whitespace-nowrap text-[10px] text-fd-muted-foreground">baseline {baseline}</span>
        </div>
        {visible.map((score, index) => (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: runs only append
            key={`${step}-${index}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute size-3.5 -translate-x-1/2 rounded-full border-2 border-fd-background",
              score < threshold ? "bg-fd-error" : "bg-fd-success",
            )}
            style={{ left: `${position(score)}%`, top: `${30 + index * 9}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-fd-muted-foreground">
        <span>{axis.min.toFixed(2)}</span>
        <span>answer_point_coverage, example scores</span>
        <span>{axis.max.toFixed(2)}</span>
      </div>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-fd-muted-foreground">
          {changed ? "New version" : "Same version, unchanged"}: {visible.length} runs, {failed} failed
        </span>
        {shown === runs.length &&
          (changed ? (
            <Badge tone="good">Regression caught</Badge>
          ) : failed > 0 ? (
            <Badge tone="bad">Fails at random</Badge>
          ) : (
            <Badge tone="good">Stable gate</Badge>
          ))}
      </div>
    </div>
  );
}
