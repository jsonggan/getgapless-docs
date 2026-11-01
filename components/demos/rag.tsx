"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useCount } from "./scene";

type Block = { level: 1 | 2 | 3 | 0; text: string };

const doc: Block[] = [
  { level: 1, text: "Travel Policy 2025" },
  { level: 2, text: "Client visits in Asia-Pacific" },
  { level: 3, text: "Allowances" },
  { level: 0, text: "You get a daily allowance of SGD 180 for meals and local transport." },
  { level: 0, text: "Hotels are capped at SGD 350 per night in Singapore." },
  { level: 3, text: "Approvals" },
  { level: 0, text: "Trips longer than 5 days need director approval. Book at least 14 days ahead." },
  { level: 2, text: "Domestic travel" },
  { level: 3, text: "Allowances" },
  { level: 0, text: "The daily allowance is USD 75. Hotels are capped at USD 220 per night." },
];

type Word = { text: string; block: number; section: number; body: boolean };

// Each word remembers its block and the H3 section it belongs to
const words: Word[] = (() => {
  const list: Word[] = [];
  let section = -1;
  doc.forEach((block, index) => {
    if (block.level === 3) section += 1;
    // H1 and H2 headings belong to the next section
    const owner = block.level === 1 || block.level === 2 ? section + 1 : section;
    for (const text of block.text.split(" ")) list.push({ text, block: index, section: owner, body: block.level === 0 });
  });
  return list;
})();

const fixedSize = 14;
const fixedChunks = Array.from({ length: Math.ceil(words.length / fixedSize) }, (_, index) =>
  words.slice(index * fixedSize, (index + 1) * fixedSize),
);
// Headings are not chunk text here: they become the section path, and later the contextual header
const sectionChunks = Array.from({ length: Math.max(...words.map((word) => word.section)) + 1 }, (_, index) =>
  words.filter((word) => word.section === index && word.body),
);

// A chunk is cut mid-sentence when the word before it does not end a sentence or a heading
function cutMidSentence(chunk: Word[]) {
  const before = words[words.indexOf(chunk[0]) - 1];
  return Boolean(before && before.block === chunk[0].block && !/[.!?]$/.test(before.text));
}

const mixesSections = (chunk: Word[]) => new Set(chunk.map((word) => word.section)).size > 1;
const badFixed = fixedChunks.filter((chunk) => cutMidSentence(chunk) || mixesSections(chunk)).length;
const pathBlocks = [0, 1, 2];

const tints = ["bg-sky-500/20", "bg-amber-500/25", "bg-emerald-500/20", "bg-fuchsia-500/20", "bg-orange-500/20"];
const sectionPaths = [
  "Client visits in Asia-Pacific > Allowances",
  "Client visits in Asia-Pacific > Approvals",
  "Domestic travel > Allowances",
];

export function ChunkingDemo() {
  return (
    <Scene
      title="Where the chunks fall"
      steps={[
        {
          label: "Every 14 words",
          duration: 5200,
          caption:
            "Cutting at a fixed size ignores the document. Chunks start mid-sentence and mix sections, so one chunk holds the end of Asia-Pacific allowances and the start of approvals.",
        },
        {
          label: "By section",
          duration: 5200,
          caption:
            "Splitting on headings first gives one chunk per topic. Each chunk can be understood on its own and matches one kind of question.",
        },
        {
          label: "With contextual header",
          duration: 5200,
          caption:
            "Out of its document, \"a daily allowance of SGD 180\" does not say which policy or which kind of trip. A header with the title and section path is added before embedding, so the chunk says what it is about.",
        },
      ]}
    >
      {(scene) => <ChunkingStage {...scene} />}
    </Scene>
  );
}

function ChunkingStage({ step, run }: SceneState) {
  const fixed = step === 0;
  const chunks = fixed ? fixedChunks : sectionChunks;
  const shown = useCount(run, chunks.length, 1800, 300);
  const chunkOf = (word: Word) => (fixed ? Math.floor(words.indexOf(word) / fixedSize) : word.body ? word.section : -1);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
      <div className="space-y-1.5 rounded-lg border bg-fd-background p-3 text-sm">
        {doc.map((block, index) => (
          <p
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed document
            key={index}
            className={cn(
              "leading-6",
              block.level === 1 && "text-base font-semibold",
              block.level === 2 && "font-semibold",
              block.level === 3 && "text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground",
            )}
          >
            {words
              .filter((word) => word.block === index)
              .map((word, position) => {
                const chunk = chunkOf(word);
                return (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed words
                    key={position}
                    className={cn(
                      "rounded-sm px-0.5 transition-all duration-300",
                      chunk >= 0 && chunk < shown && tints[chunk % tints.length],
                      step === 2 && chunk !== 0 && !pathBlocks.includes(word.block) && "opacity-30",
                      step === 2 && pathBlocks.includes(word.block) && "text-fd-primary",
                    )}
                  >
                    {word.text}{" "}
                  </span>
                );
              })}
          </p>
        ))}
      </div>
      <div className="min-w-0 space-y-2 text-xs">
        {step === 2 ? (
          <HeaderCard />
        ) : (
          chunks.slice(0, shown).map((chunk, index) => {
            const sections = new Set(chunk.map((word) => word.section)).size;
            const cut = fixed && cutMidSentence(chunk);
            return (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: chunks only append
                key={`${step}-${index}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("rounded-md p-2", tints[index % tints.length])}
              >
                <p className="mb-0.5 font-medium">
                  Chunk {index + 1}
                  {!fixed && <span className="font-normal text-fd-muted-foreground">, {sectionPaths[index]}</span>}
                </p>
                <p className="line-clamp-2 text-fd-muted-foreground">{chunk.map((word) => word.text).join(" ")}</p>
                {fixed && (sections > 1 || cut) && (
                  <p className="mt-1 flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-3" />
                    {[cut && "Starts mid-sentence", sections > 1 && `mixes ${sections} sections`].filter(Boolean).join(", ")}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
        {step < 2 && shown === chunks.length && (
          <Badge tone={fixed ? "bad" : "good"}>
            {fixed
              ? `${badFixed} of ${fixedChunks.length} chunks are cut badly`
              : "Each chunk is one topic"}
          </Badge>
        )}
      </div>
    </div>
  );
}

const headerBeats = 3;

function HeaderCard() {
  return (
    <div className="space-y-2">
      <div className="rounded-md bg-sky-500/20 p-2">
        <p className="mb-1 font-medium">Without header</p>
        <p className="text-fd-muted-foreground">
          You get a daily allowance of SGD 180 for meals and local transport. Hotels are capped at SGD 350 per night in Singapore.
        </p>
      </div>
      <div className="rounded-md bg-sky-500/20 p-2">
        <p className="mb-1 font-medium">Embedded text</p>
        {["Document: Travel Policy 2025", "Section: Client visits in Asia-Pacific > Allowances", "Updated: 2025-11-02"].map(
          (line, index) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * (1.2 / headerBeats) }}
              className="font-mono text-[11px] text-fd-primary"
            >
              {line}
            </motion.p>
          ),
        )}
        <p className="mt-1 text-fd-muted-foreground">
          You get a daily allowance of SGD 180 for meals and local transport. Hotels are capped at SGD 350 per night in Singapore.
        </p>
      </div>
    </div>
  );
}
