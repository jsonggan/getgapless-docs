"use client";

import { ExternalLink, FileText, SearchX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Cursor, Scene, type SceneState, Stack, useBeats } from "./scene";

const checkBeats = [600, 1300, 2600, 3000] as const;

export function CitationDemo() {
  return (
    <Scene
      title="Checking an answer takes seconds"
      steps={[
        {
          label: "Sourced answer",
          duration: 6000,
          caption:
            "Hover shows the source. Click opens the exact passage, where it lives, and when it was last updated, so the user can verify before booking.",
        },
        {
          label: "No source, looks normal",
          duration: 4200,
          caption:
            "Retrieval found nothing, and the model answered from general knowledge. Without a clear marker it looks like any other answer, and users trust it.",
        },
        {
          label: "No source, clearly marked",
          duration: 4200,
          caption: "The same situation, shown honestly. The user knows to check elsewhere.",
        },
      ]}
    >
      {(scene) => <CitationStage {...scene} />}
    </Scene>
  );
}

function CitationStage({ step, run }: SceneState) {
  const beat = useBeats(run, checkBeats);
  const sourced = step === 0;
  const hovering = sourced && beat >= 1 && beat < 3;
  const open = sourced && beat >= 3;

  return (
    <div className="relative flex h-60 gap-3 overflow-hidden rounded-lg border bg-fd-background p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="mb-3 ml-auto w-fit rounded-lg bg-blue-600 px-2.5 py-1 text-white">Can I fly business class to Tokyo?</p>
        <Stack active={step}>
          <div className="relative">
            <p>
              Yes. Flights over 8 hours can be booked in business class
              <span
                data-target="chip"
                className={`mx-1 rounded px-1 text-[11px] font-medium ${open ? "bg-fd-primary text-fd-primary-foreground" : "bg-fd-primary/15 text-fd-primary"}`}
              >
                1
              </span>
              with your director's approval.
            </p>
            <AnimatePresence>
              {hovering && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-12 left-6 z-10 w-56 rounded-md border bg-fd-popover p-2 text-xs shadow-lg"
                >
                  <p className="font-medium">Travel Policy 2025</p>
                  <p className="text-fd-muted-foreground">“Business class is permitted for flights longer than 8 hours…”</p>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="mt-3 text-xs text-fd-muted-foreground">Sources: [1] Travel Policy 2025</p>
          </div>
          <p>
            Most companies allow business class on long-haul flights, so you can probably book it for a flight to Tokyo.
          </p>
          <div className="rounded-md border border-dashed border-amber-500/60 bg-amber-500/10 p-2.5">
            <p className="flex items-center gap-2 font-medium">
              <SearchX className="size-4 text-amber-600" />
              No matching policy found
            </p>
            <p className="mt-1 text-fd-muted-foreground">
              I could not find this in the documents you have access to. Ask the travel team, or try different words.
            </p>
          </div>
        </Stack>
        <div className="mt-3 min-h-6">
          {step === 1 && beat >= 2 && <Badge tone="bad">Reads as fact, nothing to check</Badge>}
          {step === 2 && beat >= 2 && <Badge tone="good">User knows to look elsewhere</Badge>}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            className="w-56 shrink-0 rounded-md border bg-fd-card p-3 text-xs"
          >
            <p className="flex items-center gap-1.5 font-medium">
              <FileText className="size-3.5" />
              Travel Policy 2025
            </p>
            <p className="mt-0.5 text-fd-muted-foreground">Wiki, HR space. Updated 12 Mar 2025</p>
            <p className="mt-2 leading-5">
              4.2 Class of travel.{" "}
              <motion.mark
                initial={{ backgroundColor: "rgba(250,204,21,0)" }}
                animate={{ backgroundColor: "rgba(250,204,21,0.45)" }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="rounded px-0.5 text-inherit"
              >
                Business class is permitted for flights longer than 8 hours, with director approval.
              </motion.mark>{" "}
              All other flights are economy.
            </p>
            <p className="mt-2 flex items-center gap-1 text-fd-primary">
              Open original
              <ExternalLink className="size-3" />
            </p>
          </motion.aside>
        )}
      </AnimatePresence>
      {sourced && <Cursor target={beat === 0 || beat >= 4 ? null : "chip"} press={beat === 3} />}
    </div>
  );
}
