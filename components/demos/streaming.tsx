"use client";

import { ArrowDown, MousePointer2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Cursor, Scene, type SceneState, useBeats, useCount } from "./scene";

// One SSE response, cut by the network at awkward places: inside an event name and inside the JSON
const chunks = [
  'event: token\ndata: {"text":"Full-time"}\n\nevent: token\ndata: {"te',
  'xt":" employees"}\n\nevent: citation\nda',
  'ta: {"n":1}\n\nevent: done\ndata: {}\n\n',
];

type Parsed = { ok: true; event: string; data: Record<string, unknown> } | { ok: false; raw: string };

function parseEvent(raw: string): Parsed {
  let event = "message";
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    const i = line.indexOf(":");
    const field = i === -1 ? line : line.slice(0, i);
    const value = i === -1 ? "" : line.slice(i + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (!data.length) return { ok: false, raw };
  try {
    return { ok: true, event, data: JSON.parse(data.join("\n")) };
  } catch {
    return { ok: false, raw };
  }
}

// Parses each chunk on its own, the bug this demo is about
function parseNaive(received: number) {
  return chunks.slice(0, received).flatMap((chunk) =>
    chunk
      .split("\n\n")
      .filter(Boolean)
      .map(parseEvent),
  );
}

// Keeps the unfinished tail in a buffer and only cuts complete events, as in readSSE
function parseBuffered(received: number) {
  let buffer = "";
  const events: Parsed[] = [];
  for (const chunk of chunks.slice(0, received)) {
    buffer += chunk;
    let sep = buffer.indexOf("\n\n");
    while (sep !== -1) {
      events.push(parseEvent(buffer.slice(0, sep)));
      buffer = buffer.slice(sep + 2);
      sep = buffer.indexOf("\n\n");
    }
  }
  return { events, buffer };
}

const show = (text: string) => text.replaceAll("\n", "↵\n");

function answerOf(events: Parsed[]) {
  return events
    .map((event) => (event.ok && event.event === "token" ? String(event.data.text) : ""))
    .join("");
}

const chunkBeats = [700, 2300, 3900] as const;
const lostEvents = parseBuffered(chunks.length).events.length - parseNaive(chunks.length).filter((event) => event.ok).length;

export function SSEParsingDemo() {
  return (
    <Scene
      title="Events split across chunks"
      steps={[
        {
          label: "Parse each chunk",
          duration: 6200,
          caption:
            "Each network chunk is parsed on its own. Events cut in half fail to parse, so a word and a citation silently go missing.",
        },
        {
          label: "Buffer until a blank line",
          duration: 6200,
          caption:
            "Unfinished text waits in a buffer. An event is cut out only when its blank line arrives, so every event parses.",
        },
      ]}
    >
      {(scene) => <SSEStage {...scene} />}
    </Scene>
  );
}

function SSEStage({ step, run }: SceneState) {
  const buffered = step === 1;
  const received = useBeats(run, chunkBeats);
  const naive = parseNaive(received);
  const safe = parseBuffered(received);
  const events = buffered ? safe.events : naive;
  const answer = answerOf(events);
  const finished = received === chunks.length;

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        <Lane title="Network chunks">
          {chunks.map((chunk, index) => (
            <motion.pre
              key={chunk}
              initial={false}
              animate={{ opacity: index < received ? 1 : 0.15, x: index < received ? 0 : -8 }}
              className="mb-2 whitespace-pre-wrap break-all rounded-md border border-dashed bg-fd-background p-2 font-mono text-[11px] leading-4"
            >
              <span className="mb-1 block font-sans text-[10px] font-medium text-fd-muted-foreground">
                Chunk {index + 1}
              </span>
              {show(chunk)}
            </motion.pre>
          ))}
        </Lane>
        <Lane title={buffered ? "Buffer, waiting for a blank line" : "Buffer"}>
          {buffered ? (
            <motion.pre
              key={safe.buffer}
              initial={{ backgroundColor: "rgba(59,130,246,0.18)" }}
              animate={{ backgroundColor: "rgba(59,130,246,0)" }}
              transition={{ duration: 0.8 }}
              className="min-h-10 whitespace-pre-wrap break-all rounded-md border bg-fd-background p-2 font-mono text-[11px] leading-4"
            >
              {safe.buffer ? show(safe.buffer) : <span className="font-sans text-fd-muted-foreground">Empty</span>}
            </motion.pre>
          ) : (
            <p className="rounded-md border border-dashed p-2 text-xs text-fd-muted-foreground">
              None. Whatever is left at the end of a chunk is thrown away.
            </p>
          )}
        </Lane>
        <Lane title="Parsed events">
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {events.map((event, index) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: events only ever append
                  key={`${step}-${index}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px]",
                    event.ok ? "bg-fd-success/10 text-fd-success" : "bg-fd-error/10 text-fd-error",
                  )}
                >
                  {event.ok ? (
                    <>
                      {event.event} {JSON.stringify(event.data)}
                    </>
                  ) : (
                    <>
                      broken: {event.raw.replaceAll("\n", "↵")}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Lane>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-fd-background px-3 py-2">
        <span>
          <span className="text-fd-muted-foreground">On screen: </span>
          {answer}
          {answer && buffered && finished && <sup className="ml-0.5 rounded bg-fd-primary/15 px-1 text-fd-primary">1</sup>}
        </span>
        {finished && (
          <Badge tone={buffered ? "good" : "bad"}>
            {buffered ? "Every event parsed" : `${lostEvents} events lost`}
          </Badge>
        )}
      </div>
    </div>
  );
}

function Lane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg bg-fd-muted/50 p-2.5">
      <p className="mb-2 text-xs font-medium text-fd-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

const answerLines = [
  "Full-time employees get 16 weeks of paid",
  "parental leave. Part-time employees get the",
  "same leave, paid in proportion to their",
  "contracted hours.",
  "",
  "You can take the leave in up to two blocks",
  "within the first year after the birth or",
  "adoption. Tell your manager at least four",
  "weeks before each block starts.",
  "",
  "If both parents work here, each parent gets",
  "the full 16 weeks. The leave cannot be",
  "transferred between parents.",
  "",
  "Pay during leave is your normal salary,",
  "including any fixed allowances. Bonuses",
  "are paid as usual.",
  "",
  "To apply, open a leave request in the HR",
  "portal and attach the expected due date.",
  "Sources: Parental Leave Policy 2025 [1]",
];

const rowHeight = 22;
const viewHeight = 110;
// scroll up, yank or show button, click Jump, done
const scrollBeats = [2000, 2600, 4000, 4600] as const;

export function AutoScrollDemo() {
  return (
    <Scene
      title="Follow the stream only at the bottom"
      steps={[
        {
          label: "Always follow",
          duration: 6400,
          caption:
            "The user scrolls up to reread the first line. The next token drags them back to the bottom, again and again.",
        },
        {
          label: "Follow at the bottom",
          duration: 6400,
          caption:
            "Scrolling up pauses following and shows Jump to latest. Clicking it, or scrolling back down, resumes following.",
        },
      ]}
    >
      {(scene) => <AutoScrollStage {...scene} />}
    </Scene>
  );
}

function AutoScrollStage({ step, run }: SceneState) {
  const smart = step === 1;
  const lines = useCount(run, answerLines.length, 5000, 200);
  const beat = useBeats(run, scrollBeats);
  const contentHeight = 12 + lines * rowHeight;
  const bottom = Math.max(0, contentHeight - viewHeight);
  const readingAbove = smart ? beat >= 1 && beat < 3 : beat === 1 || beat === 3;
  const offset = readingAbove ? 0 : bottom;

  const status = smart
    ? beat === 0
      ? { tone: "neutral" as const, text: "At the bottom, following" }
      : beat < 3
        ? { tone: "good" as const, text: "Reading above, not following" }
        : { tone: "good" as const, text: "Back at the bottom, following" }
    : beat === 0
      ? { tone: "neutral" as const, text: "At the bottom, following" }
      : beat === 1 || beat === 3
        ? { tone: "neutral" as const, text: beat === 1 ? "Scrolled up to reread" : "Scrolled up again" }
        : { tone: "bad" as const, text: "Pulled back down while reading" };

  const target = beat === 0 ? null : !smart ? "viewport" : beat === 1 ? "viewport" : beat < 4 ? "jump" : null;

  return (
    <div className="relative space-y-3">
      <div
        data-target="viewport"
        className="relative overflow-hidden rounded-lg border bg-fd-background"
        style={{ height: viewHeight }}
      >
        <motion.div
          className="px-3 pt-1.5 text-sm"
          animate={{ y: -offset }}
          transition={smart ? { type: "spring", stiffness: 160, damping: 24 } : { duration: 0.12 }}
        >
          {answerLines.slice(0, lines).map((line, index) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: lines are fixed and only append
              key={index}
              className={cn("truncate", index === 0 && readingAbove && "rounded bg-amber-500/15")}
              style={{ height: rowHeight, lineHeight: `${rowHeight}px` }}
            >
              {line}
            </p>
          ))}
        </motion.div>
        <AnimatePresence>
          {smart && beat >= 1 && beat < 4 && (
            <motion.span
              data-target="jump"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-fd-primary px-3 py-1 text-xs font-medium text-fd-primary-foreground shadow"
            >
              <ArrowDown className="size-3.5" />
              Jump to latest
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-fd-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MousePointer2 className="size-3.5" />
          {beat === 0
            ? "User is waiting at the bottom"
            : beat === 1 || (!smart && beat === 3)
              ? "User scrolls up"
              : smart && beat >= 3
                ? "User clicked Jump to latest"
                : "User keeps reading"}
        </span>
        <Badge tone={status.tone}>{status.text}</Badge>
      </div>
      <Cursor target={target} press={smart && beat === 3} />
    </div>
  );
}

const history = [
  { who: "You", text: "How much parental leave do I get?" },
  { who: "Assistant", text: "Full-time employees get 16 weeks of paid parental leave [1]." },
  { who: "You", text: "Can I split it?" },
  { who: "Assistant", text: "Yes, in up to two blocks within the first year [1]." },
];

const streamedReply = "If both parents work here, each parent gets the full 16 weeks.";
const tokenCount = 240;
const renderTime = 3000;
const framesPerSecond = 60;
const tokensPerSecond = tokenCount / (renderTime / 1000);

export function RenderCountDemo() {
  return (
    <Scene
      title="Who re-renders on each token"
      steps={[
        {
          label: "Every token, every message",
          duration: renderTime + 2600,
          caption:
            "Each token updates shared state, so every message in the list renders again, 80 times a second. Long chats start to stutter.",
        },
        {
          label: "Batched, streaming message only",
          duration: renderTime + 2600,
          caption:
            "Finished messages are memoized and never render again. The streaming message flushes its buffer once per animation frame, at most 60 times a second.",
        },
      ]}
    >
      {(scene) => <RenderCountStage {...scene} />}
    </Scene>
  );
}

function RenderCountStage({ step, run }: SceneState) {
  const fixed = step === 1;
  const tokens = useCount(run, tokenCount, renderTime, 300);
  const streaming = tokens > 0 && tokens < tokenCount;
  const streamRenders = fixed ? Math.ceil(tokens * Math.min(1, framesPerSecond / tokensPerSecond)) : tokens;
  const oldRenders = fixed ? 1 : 1 + tokens;
  const total = history.length * oldRenders + streamRenders;
  const rows = [...history.map((message) => ({ ...message, renders: oldRenders, live: !fixed && streaming })), {
    who: "Assistant",
    text: streamedReply.slice(0, Math.round((streamedReply.length * tokens) / tokenCount)),
    renders: streamRenders,
    live: streaming,
  }];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5 rounded-lg border bg-fd-background p-3 text-sm">
        {rows.map((row, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
            key={index}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-shadow",
              row.live && "ring-2 ring-amber-500/70",
            )}
          >
            <span className="min-w-0 truncate">
              <span className="text-fd-muted-foreground">{row.who}: </span>
              {row.text}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums",
                row.live ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-fd-muted text-fd-muted-foreground",
              )}
            >
              {row.renders} {row.renders === 1 ? "render" : "renders"}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fd-muted-foreground">
        <span className="tabular-nums">
          {tokens} tokens received, {total} renders in total
        </span>
        {tokens === tokenCount && (
          <Badge tone={fixed ? "good" : "bad"}>{fixed ? "Only the new message did work" : "Old messages rendered 241 times each"}</Badge>
        )}
      </div>
    </div>
  );
}
