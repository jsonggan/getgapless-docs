import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// available as <Highlight color="...">
const colors = {
  yellow: "bg-yellow-200 dark:bg-yellow-300 dark:text-neutral-950",
  green: "bg-green-200 dark:bg-green-400/30",
  blue: "bg-blue-200 dark:bg-blue-400/30",
  red: "bg-red-200 dark:bg-red-400/30",
} as const;

export type HighlightColor = keyof typeof colors;

export function Highlight({
  color = "yellow",
  className,
  ...props
}: Omit<ComponentProps<"mark">, "color"> & { color?: HighlightColor }) {
  return (
    <mark
      className={cn(
        "rounded-sm px-1 text-inherit box-decoration-clone",
        colors[color],
        className,
      )}
      {...props}
    />
  );
}
