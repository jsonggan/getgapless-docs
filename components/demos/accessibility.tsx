"use client";

import { Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useCount } from "./scene";

const words =
  "Full-time employees get 16 weeks of paid parental leave. You can take it in up to two blocks within the first year.".split(
    " ",
  );

const streamTime = 5200;
// The screen reader picks up a change about every few words while it is still speaking the last one
const wordsPerAnnouncement = 3;

export function LiveRegionDemo() {
  return (
    <Scene
      title="What the screen reader hears"
      steps={[
        {
          label: "Message is a live region",
          duration: streamTime + 2200,
          caption:
            "Every batch of tokens is a change to announce. Depending on the screen reader, it reads every fragment or keeps cutting itself off. Either way the user hears pieces, not an answer.",
        },
        {
          label: "Separate status region",
          duration: streamTime + 2200,
          caption:
            "The message updates silently. A hidden status region announces only that the answer started and finished. The user then reads the message at their own pace.",
        },
      ]}
    >
      {(scene) => <LiveRegionStage {...scene} />}
    </Scene>
  );
}

function LiveRegionStage({ step, run }: SceneState) {
  const fixed = step === 1;
  const count = useCount(run, words.length, streamTime, 400);
  const done = count === words.length;

  const announcements = fixed
    ? [
        ...(count > 0 ? ["Assistant is responding"] : []),
        ...(done ? ["Response complete"] : []),
      ]
    : Array.from({ length: Math.ceil(count / wordsPerAnnouncement) }, (_, index) =>
        words.slice(index * wordsPerAnnouncement, (index + 1) * wordsPerAnnouncement).join(" "),
      );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium text-fd-muted-foreground">
          On screen{" "}
          <code className="rounded bg-fd-muted px-1 font-mono text-[11px]">{fixed ? "not a live region" : 'aria-live="polite"'}</code>
        </p>
        <p className="h-36 rounded-lg border bg-fd-background p-3 text-sm">
          {words.slice(0, count).join(" ")}
          {!done && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-fd-foreground align-text-bottom" />}
        </p>
      </div>
      <div className="min-w-0">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fd-muted-foreground">
          <Volume2 className="size-3.5" />
          Spoken{" "}
          {fixed && <code className="rounded bg-fd-muted px-1 font-mono text-[11px]">role="status"</code>}
        </p>
        <div className="flex h-36 flex-col justify-end gap-0.5 overflow-hidden rounded-lg border bg-fd-background p-3 text-xs leading-5">
          <AnimatePresence initial={false}>
            {announcements.map((text, index) => {
              const cutOff = !fixed && index < announcements.length - 1;
              return (
                <motion.p
                  key={`${step}-${text}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: cutOff ? 0.55 : 1, x: 0 }}
                  className={cn("flex items-center gap-2", cutOff && "line-through decoration-fd-error")}
                >
                  “{text}”
                  {cutOff && <span className="text-[10px] text-fd-error no-underline">cut off</span>}
                </motion.p>
              );
            })}
          </AnimatePresence>
        </div>
        <div className="mt-2 min-h-6">
          {done && (
            <Badge tone={fixed ? "good" : "bad"}>
              {fixed ? "2 clear announcements" : `${announcements.length} fragments, no whole answer`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
