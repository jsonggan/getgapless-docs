"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Shared shell for every interactive demo: title, controls, live preview, caption
export function DemoFrame({
  title,
  action,
  controls,
  caption,
  children,
}: {
  title: string;
  action?: ReactNode;
  controls?: ReactNode;
  caption?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="not-prose relative my-6 overflow-hidden rounded-xl border bg-fd-card text-fd-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-xs font-medium text-fd-primary">
            Try it
          </span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        {action}
      </div>
      {controls && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-fd-muted/40 px-4 py-3">
          {controls}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {caption && (
        <figcaption className="border-t px-4 py-3 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-fd-muted-foreground">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 accent-fd-primary"
      />
      <span className="w-12 tabular-nums">
        {value}
        {unit}
      </span>
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {label && <span className="text-fd-muted-foreground">{label}</span>}
      <div className="inline-flex rounded-lg border bg-fd-background p-0.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-md px-3 py-1 transition-colors",
              option === value
                ? "bg-fd-primary text-fd-primary-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-fd-primary"
      />
      <span className="text-fd-muted-foreground">{label}</span>
    </label>
  );
}

// Side-by-side "bad vs good" columns that stack on narrow screens
export function Compare({
  bad,
  good,
  badLabel = "Without",
  goodLabel = "With",
}: {
  bad: ReactNode;
  good: ReactNode;
  badLabel?: string;
  goodLabel?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fd-error">
          {badLabel}
        </p>
        {bad}
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fd-success">
          {goodLabel}
        </p>
        {good}
      </div>
    </div>
  );
}
