"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Scene, type SceneState } from "./scene";

// FNV-1a, a small stable string hash, standing in for hash() in variantFor on the page
function hash(text: string) {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value;
}

const users = Array.from({ length: 100 }, (_, index) => `user-${String(index + 1).padStart(3, "0")}`);
const bucket = (rollout: string, user: string) => hash(`${rollout}:${user}`) % 100;

const stages = [
  { rollout: "prompt-v8", percent: 5 },
  { rollout: "prompt-v8", percent: 25 },
  { rollout: "prompt-v8", percent: 50 },
  { rollout: "model-v3", percent: 5 },
];

const firstCanaries = new Set(users.filter((user) => bucket("prompt-v8", user) < 5));

export function RolloutAssignmentDemo() {
  return (
    <Scene
      title="Who gets the new version"
      steps={[
        { label: "prompt-v8 at 5%", caption: "Each user's bucket is hash(rollout ID + user ID) % 100. Users in buckets 0 to 4 get the candidate." },
        {
          label: "25%",
          caption: "Raising the percent only adds users. Everyone already on the candidate stays on it, so nobody flips back and forth between versions.",
        },
        { label: "50%", caption: "Still the same users plus more. Each user sees one version for the whole rollout." },
        {
          label: "model-v3 at 5%",
          caption:
            "A different rollout ID gives every user a new, independent bucket. The canaries for this rollout are mostly different people, so the same users do not always take the risk.",
        },
      ]}
    >
      {(scene) => <AssignmentStage {...scene} />}
    </Scene>
  );
}

function AssignmentStage({ step }: SceneState) {
  const { rollout, percent } = stages[step];
  const inCandidate = (user: string) => bucket(rollout, user) < percent;
  const count = users.filter(inCandidate).length;
  const sameRollout = rollout === "prompt-v8";
  const overlap = users.filter((user) => inCandidate(user) && firstCanaries.has(user)).length;

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="grid w-fit grid-cols-10 gap-1.5">
        {users.map((user) => {
          const candidate = inCandidate(user);
          const earlier = sameRollout ? firstCanaries.has(user) && step > 0 : firstCanaries.has(user);
          return (
            <motion.span
              key={user}
              title={`${user}, bucket ${bucket(rollout, user)}`}
              initial={false}
              animate={{ scale: candidate ? 1 : 0.8 }}
              className={cn(
                "size-4 rounded-full transition-colors duration-500 sm:size-5",
                candidate ? "bg-fd-primary" : "bg-fd-muted",
                earlier && "ring-2 ring-amber-500 ring-offset-1 ring-offset-fd-card",
              )}
            />
          );
        })}
      </div>
      <div className="space-y-3 text-sm">
        <p className="font-mono text-xs text-fd-muted-foreground">
          hash(&quot;{rollout}:user-042&quot;) % 100 = {bucket(rollout, "user-042")}
        </p>
        <p>
          <span className="text-2xl font-semibold tabular-nums">{count}</span>
          <span className="text-fd-muted-foreground"> of 100 users on {rollout}</span>
        </p>
        <div className="space-y-1.5 text-xs text-fd-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-fd-primary" />
            Candidate version
          </p>
          {step > 0 && (
            <p className="flex items-center gap-2">
              <span className="size-3 rounded-full ring-2 ring-amber-500" />
              {sameRollout
                ? `First 5% group: ${overlap} of ${firstCanaries.size} still on the candidate`
                : `prompt-v8's first canaries: ${overlap} of ${firstCanaries.size} picked again`}
            </p>
          )}
        </div>
        <p className="text-xs text-fd-muted-foreground">
          With 100 users the share is close to, not exactly, the target. With thousands it evens out.
        </p>
      </div>
    </div>
  );
}
