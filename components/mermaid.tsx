"use client";

import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useTheme } from "next-themes";
import {
  type PointerEvent,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(
    cachePromise("mermaid", () => import("mermaid")),
  );

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    fontFamily: "inherit",
    theme: resolvedTheme === "dark" ? "dark" : "default",
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () =>
      mermaid.render(id.replaceAll(":", ""), chart),
    ),
  );

  return (
    <DiagramViewer>
      <div
        ref={(container) => {
          if (container) bindFunctions?.(container);
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid renders SVG from our own content
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </DiagramViewer>
  );
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const STEP = 1.25;

type View = { scale: number; x: number; y: number };
// Room around the fitted diagram, kept clear of the toolbar and hint.
const FIT_PADDING_X = 16;
const FIT_PADDING_Y = 48;

// Fits the diagram to the box on load. Pan by dragging, zoom with the buttons
// or Ctrl/Cmd + wheel (plain wheel in fullscreen).
function DiagramViewer({ children }: { children: ReactNode }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  if (fullscreen) {
    return (
      <>
        <div className="my-6 rounded-xl border bg-fd-card p-4 text-center text-sm text-fd-muted-foreground">
          Diagram open in fullscreen
        </div>
        <div className="fixed inset-0 z-50 flex flex-col bg-fd-background">
          <PanZoom fullscreen onToggleFullscreen={() => setFullscreen(false)}>
            {children}
          </PanZoom>
        </div>
      </>
    );
  }

  return (
    <div className="not-prose relative my-6 w-full overflow-hidden rounded-xl border bg-fd-card">
      {/* Sizes the box to the diagram's shape; the viewer fills it. */}
      <div
        className="max-h-[70vh] min-h-40 w-full"
        style={{ aspectRatio: aspect, margin: `${FIT_PADDING_Y}px 0` }}
      />
      <div className="absolute inset-0">
        <PanZoom
          onToggleFullscreen={() => setFullscreen(true)}
          onMeasure={setAspect}
        >
          {children}
        </PanZoom>
      </div>
    </div>
  );
}

function PanZoom({
  children,
  fullscreen = false,
  onToggleFullscreen,
  onMeasure,
}: {
  children: ReactNode;
  fullscreen?: boolean;
  onToggleFullscreen: () => void;
  onMeasure?: (aspect: number) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Scale the diagram to fill the viewport and center it.
  const fitToView = useCallback(() => {
    const el = viewportRef.current;
    const svg = contentRef.current?.querySelector("svg");
    if (!el || !svg) return;
    const box = svg.viewBox.baseVal;
    if (!box?.width || !box.height) return;
    svg.setAttribute("width", String(box.width));
    svg.setAttribute("height", String(box.height));
    svg.style.maxWidth = "none";
    const scale = Math.min(
      (el.clientWidth - FIT_PADDING_X * 2) / box.width,
      (el.clientHeight - FIT_PADDING_Y * 2) / box.height,
    );
    setView({
      scale,
      x: (el.clientWidth - box.width * scale) / 2,
      y: (el.clientHeight - box.height * scale) / 2,
    });
    onMeasure?.(box.width / box.height);
  }, [onMeasure]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    fitToView();
    const observer = new ResizeObserver(() => fitToView());
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitToView]);

  // Zoom around a point given in viewport coordinates.
  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setView((v) => {
      if (!v) return v;
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      const k = scale / v.scale;
      return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const zoomCenter = (factor: number) => {
    const el = viewportRef.current;
    if (!el) return;
    zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2);
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!fullscreen && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        e.deltaY < 0 ? 1.1 : 1 / 1.1,
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [fullscreen, zoomAt]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setView((v) => v && { ...v, x: v.x + dx, y: v.y + dy });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="relative size-full min-h-0 flex-1">
      <div
        ref={viewportRef}
        className="size-full cursor-grab touch-none overflow-hidden active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={contentRef}
          className="w-max"
          style={{
            transform: view
              ? `translate(${view.x}px, ${view.y}px) scale(${view.scale})`
              : undefined,
            transformOrigin: "0 0",
            visibility: view ? "visible" : "hidden",
          }}
        >
          {children}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 rounded-lg border bg-fd-background/90 p-1 shadow-sm">
        <ToolButton label="Zoom in" onClick={() => zoomCenter(STEP)}>
          <Plus className="size-4" />
        </ToolButton>
        <ToolButton label="Zoom out" onClick={() => zoomCenter(1 / STEP)}>
          <Minus className="size-4" />
        </ToolButton>
        <ToolButton label="Fit to view" onClick={fitToView}>
          <RotateCcw className="size-4" />
        </ToolButton>
        <ToolButton
          label={fullscreen ? "Close fullscreen" : "Open fullscreen"}
          onClick={onToggleFullscreen}
        >
          {fullscreen ? (
            <X className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </ToolButton>
      </div>
      {!fullscreen && (
        <p className="pointer-events-none absolute bottom-2 left-3 text-xs text-fd-muted-foreground">
          Drag to pan. Ctrl + scroll to zoom.
        </p>
      )}
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-md p-1.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      {children}
    </button>
  );
}
