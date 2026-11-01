"use client";

import { Laptop, Server, Ticket, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Badge, Scene, type SceneState, useBeats } from "./scene";

const beats = [400, 1300, 1900, 2300, 3000, 3500, 4400, 4900, 5600] as const;

export function IdempotencyDemo() {
  return (
    <Scene
      title="A retry after a lost response"
      steps={[
        {
          label: "No key",
          duration: 7400,
          caption:
            "The server created the ticket, but the response was lost. The client retries, and the server has no way to know it already did the work. Two tickets.",
        },
        {
          label: "With Idempotency-Key",
          duration: 7400,
          caption:
            "The retry carries the same key. The server finds it marked finished and returns the stored result without doing the work again. One ticket.",
        },
      ]}
    >
      {(scene) => <IdempotencyStage {...scene} />}
    </Scene>
  );
}

type Packet = { id: string; to: "server" | "client"; label: string; lost?: boolean };

function IdempotencyStage({ step, run }: SceneState) {
  const keyed = step === 1;
  const beat = useBeats(run, beats);

  const packet: Packet | null =
    beat >= 1 && beat < 3
      ? { id: "req1", to: "server", label: "POST /tickets" }
      : beat >= 4 && beat < 6
        ? { id: "res1", to: "client", label: "201 IT-4821", lost: true }
        : beat >= 6 && beat < 8
          ? { id: "req2", to: "server", label: "POST /tickets (retry)" }
          : beat >= 8
            ? { id: "res2", to: "client", label: keyed ? "201 IT-4821" : "201 IT-4822" }
            : null;

  const tickets = [...(beat >= 3 ? ["IT-4821"] : []), ...(!keyed && beat >= 7 ? ["IT-4822"] : [])];
  const keyStatus = !keyed ? null : beat >= 3 ? "finished, result IT-4821" : beat >= 2 ? "in progress" : null;

  const serverNote =
    beat >= 7
      ? keyed
        ? "Key found and finished. Returning the stored result."
        : "New request. Creating a ticket."
      : beat >= 2 && beat < 4
        ? "Creating a ticket."
        : "";

  const clientNote =
    beat >= 9
      ? `Got ${keyed ? "IT-4821" : "IT-4822"}`
      : beat >= 5 && beat < 7
        ? "No response. Retrying."
        : beat >= 1 && beat < 5
          ? "Waiting for response"
          : "";

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-[6.5rem_1fr_6.5rem] items-start gap-2">
        <Node icon={<Laptop className="size-4" />} title="Client" note={clientNote} />
        <div className="relative mt-4 h-12">
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed" />
          <AnimatePresence>
            {packet && (
              <motion.div
                key={`${step}-${packet.id}`}
                className="absolute top-1/2 left-0 w-full -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className={cn(
                    "absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10px]",
                    packet.lost ? "bg-fd-error/15 text-fd-error" : "bg-fd-primary text-fd-primary-foreground",
                  )}
                  initial={{ left: packet.to === "server" ? "15%" : "85%" }}
                  animate={{ left: packet.lost ? "50%" : packet.to === "server" ? "85%" : "15%" }}
                  transition={{ duration: packet.lost ? 0.5 : 0.8, ease: "easeInOut" }}
                >
                  {packet.lost && <X className="size-3" />}
                  {packet.label}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          {keyed && beat >= 1 && (
            <p className="absolute inset-x-0 top-full text-center font-mono text-[10px] text-fd-muted-foreground">
              Idempotency-Key: 5b0c…7a11
            </p>
          )}
        </div>
        <Node icon={<Server className="size-4" />} title="Server" note={serverNote} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-fd-background p-3">
          <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Idempotency keys</p>
          <p className="font-mono text-xs">
            {keyed ? (keyStatus ? `5b0c…7a11: ${keyStatus}` : "Empty") : "Not used"}
          </p>
        </div>
        <div className="rounded-lg border bg-fd-background p-3">
          <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Tickets in the IT system</p>
          <div className="flex min-h-6 flex-wrap gap-2">
            <AnimatePresence>
              {tickets.map((ticket) => (
                <motion.span
                  key={`${step}-${ticket}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs",
                    ticket === "IT-4822" ? "bg-fd-error/15 text-fd-error" : "bg-fd-muted",
                  )}
                >
                  <Ticket className="size-3.5" />
                  {ticket}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="flex min-h-6 justify-end">
        {beat >= 9 && (
          <Badge tone={keyed ? "good" : "bad"}>{keyed ? "1 ticket, as the user intended" : "Duplicate ticket created"}</Badge>
        )}
      </div>
    </div>
  );
}

function Node({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg border bg-fd-background">{icon}</span>
      <span className="text-xs font-medium">{title}</span>
      <motion.span key={note} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-8 text-[11px] leading-4 text-fd-muted-foreground">
        {note}
      </motion.span>
    </div>
  );
}
