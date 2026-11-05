"use client";

import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Scene, type SceneState } from "./scene";

const capacity = 5;
const refillPerSecond = 0.8;
const windowMs = 8000;
const tickMs = 100;

// Three quick follow-ups, a pause, then a script firing seven requests in 0.6 seconds
const script = [500, 900, 1300, 3600, 3700, 3800, 3900, 4000, 4100, 4200];

type Request = { id: number; at: number; allowed: boolean; retryAfter: number };

export function TokenBucketDemo() {
  return (
    <Scene
      title="Token bucket"
      steps={[
        {
          label: "Burst, then a script",
          duration: windowMs,
          caption:
            "Three quick follow-ups pass because the bucket was full. A script then fires seven requests in 0.6 seconds: four empty the bucket, three get 429 with Retry-After. The bucket refills at a steady rate. Try sending your own.",
        },
      ]}
    >
      {(scene) => <BucketStage {...scene} />}
    </Scene>
  );
}

function BucketStage({ run, stop }: SceneState) {
  const [now, setNow] = useState(0);
  const [requests, setRequests] = useState<Request[]>([]);
  const tokens = useRef(capacity);
  const last = useRef(0);
  const clock = useRef(0);
  const manual = useRef(false);
  const nextId = useRef(0);

  // One simulated clock that refills the bucket, so manual requests keep working after the script stops
  useEffect(() => {
    const interval = setInterval(() => {
      clock.current += tickMs;
      setNow(clock.current);
    }, tickMs);
    return () => clearInterval(interval);
  }, []);

  const take = () => {
    const at = clock.current;
    tokens.current = Math.min(capacity, tokens.current + ((at - last.current) / 1000) * refillPerSecond);
    last.current = at;
    const allowed = tokens.current >= 1;
    if (allowed) tokens.current -= 1;
    const retryAfter = allowed ? 0 : Math.ceil((1 - tokens.current) / refillPerSecond);
    nextId.current += 1;
    const request = { id: nextId.current, at, allowed, retryAfter };
    setRequests((list) => [...list.filter((item) => at - item.at < windowMs), request]);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the script restarts only when the scene restarts
  useEffect(() => {
    if (run === 0) return;
    manual.current = false;
    tokens.current = capacity;
    last.current = clock.current;
    setRequests([]);
    const timers = script.map((time) =>
      setTimeout(() => {
        if (!manual.current) take();
      }, time),
    );
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [run]);

  const level = Math.min(capacity, tokens.current + ((now - last.current) / 1000) * refillPerSecond);
  const latest = requests.at(-1);
  const visible = requests.filter((request) => now - request.at < windowMs);

  return (
    <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-fd-muted-foreground">+{refillPerSecond} per second</span>
        <div className="flex h-44 w-24 flex-col-reverse gap-1 rounded-b-2xl border-2 border-t-0 border-fd-muted-foreground/40 p-1.5">
          {Array.from({ length: capacity }, (_, index) => {
            const fill = Math.max(0, Math.min(1, level - index));
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed slots
              <div key={index} className="relative flex-1 overflow-hidden rounded-md bg-fd-muted">
                <motion.div
                  className="absolute inset-x-0 bottom-0 bg-fd-primary"
                  animate={{ height: `${fill * 100}%` }}
                  transition={{ duration: tickMs / 1000, ease: "linear" }}
                />
              </div>
            );
          })}
        </div>
        <span className="text-sm tabular-nums">
          {level.toFixed(1)} of {capacity} tokens
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            stop();
            manual.current = true;
            take();
          }}
          className="flex w-fit items-center gap-2 rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground"
        >
          <Send className="size-4" />
          Send a request
        </button>
        <div>
          <p className="mb-1 text-xs text-fd-muted-foreground">Last 8 seconds</p>
          <div className="relative h-10 rounded-md border bg-fd-background">
            {visible.map((request) => (
              <motion.span
                key={request.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute top-1/2 size-3 -translate-y-1/2 rounded-full",
                  request.allowed ? "bg-fd-success" : "bg-fd-error",
                )}
                style={{ right: `${((now - request.at) / windowMs) * 96 + 2}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-fd-muted-foreground">
            <span>8 s ago</span>
            <span>now</span>
          </div>
        </div>
        <div className="flex min-h-14 items-center rounded-md bg-fd-muted/50 px-3 py-2 font-mono text-xs">
          <AnimatePresence mode="wait">
            {latest ? (
              <motion.div key={latest.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                {latest.allowed ? (
                  <span className="text-fd-success">200 OK, 1 token taken</span>
                ) : (
                  <span className="text-fd-error">
                    429 Too Many Requests
                    <br />
                    Retry-After: {latest.retryAfter}
                  </span>
                )}
              </motion.div>
            ) : (
              <span className="text-fd-muted-foreground">Waiting for requests</span>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-fd-muted-foreground tabular-nums">
          {visible.filter((request) => request.allowed).length} allowed,{" "}
          {visible.filter((request) => !request.allowed).length} rejected
        </p>
      </div>
    </div>
  );
}
