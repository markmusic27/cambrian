"use client";

/*
 * A small label, like a museum's, that fades in just below the sculpture when the cursor comes
 * into the rectangle around it, saying what inspired it. It fades out when the cursor leaves the
 * rectangle, or after HOLD ms even if it doesn't, and comes back the next time the cursor comes
 * into the rectangle. While the cursor is on the label itself it stays, and the HOLD starts over
 * once the cursor moves off it. The rectangle reaches down to take in the label too, so the
 * cursor can move onto it: it links to the artwork's page at the Centre Pompidou. The label is
 * placed when it appears and holds still while shown, though the sculpture sways.
 *
 * The sculpture's canvas takes no pointer events, so the rectangle comes from where its sheets
 * and wires are right now (live.ts), leaving out the long thread it hangs from. Only in the
 * side view (the sculpture beside the text, not stacked above it) and only for a mouse or pen:
 * on touch, a tap stirs the sculpture instead. (The same credit is note 0 at the bottom of the
 * page.)
 */

import { useEffect, useRef, useState } from "react";
import { live } from "./live";

/** The artwork's page at the Centre Pompidou, which the label links to. */
const ARTWORK = "https://www.centrepompidou.fr/en/ressources/oeuvre/cynjBoX";
/** For tuning: shows the hover rectangle in red. Leave false on the live page. */
const SHOW_AREA = false;
/** How far (CSS px) the rectangle reaches past the sculpture and the label. */
const PAD = 12;
/** The label's gap below the lowest sheet, and from the window's edge (CSS px). */
const GAP = 48;
const EDGE = 8;
/** How long (ms) the label stays once it's in; the cursor on the label itself holds it there. */
const HOLD = 4000;

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** Whether the sculpture hangs beside the text (narrow windows stack it above, globals.css). */
function sideView() {
  return !document.documentElement.hasAttribute("data-stacked") && innerWidth >= 768;
}

/** The box around the sculpture's sheets and wires, in window px, or null without one. */
function artBox(): Box | null {
  const canvas = live.canvas;
  if (!canvas || !live.sheets.length) return null;
  const c = canvas.getBoundingClientRect();
  let l = Infinity;
  let t = Infinity;
  let r = -Infinity;
  let b = -Infinity;
  for (const s of live.sheets) {
    l = Math.min(l, s.x - s.r);
    r = Math.max(r, s.x + s.r);
    t = Math.min(t, s.y - s.r);
    b = Math.max(b, s.y + s.r);
  }
  // The wires come as x1, y1, x2, y2 segments; the first is the thread down from the top.
  const w = live.wires;
  for (let j = 4; j + 1 < w.length; j += 2) {
    l = Math.min(l, w[j]);
    r = Math.max(r, w[j]);
    t = Math.min(t, w[j + 1]);
    b = Math.max(b, w[j + 1]);
  }
  return { l: l + c.left, t: t + c.top, r: r + c.left, b: b + c.top };
}

/** Where the label goes for a sculpture in `art`: centered just below it, kept on screen. */
function labelBox(art: Box, w: number, h: number): Box {
  const l = Math.min(Math.max(EDGE, (art.l + art.r) / 2 - w / 2), innerWidth - w - EDGE);
  const t = art.b + GAP;
  return { l, t, r: l + w, b: t + h };
}

/** The hover rectangle: the sculpture and the label, padded. */
function area(art: Box, label: Box): Box {
  return {
    l: Math.min(art.l, label.l) - PAD,
    t: art.t - PAD,
    r: Math.max(art.r, label.r) + PAD,
    b: label.b + PAD,
  };
}

export default function ArtCredit() {
  const ref = useRef<HTMLAnchorElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  // Why it last hid: the hold running out fades it 1.5× as slowly as the cursor leaving does.
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let x = -1;
    let y = -1;
    let frame = 0;
    let placed: Box | null = null; // where the label sits while it's showing (null while hidden)
    let armed = true; // whether coming into the rectangle shows it (once out of it since it last showed)
    let timer = 0;

    /** The hover rectangle right now, or null when there's none (no sculpture, not the side view). */
    const current = () => {
      const el = ref.current;
      const art = sideView() ? artBox() : null;
      if (!art || !el) return null;
      const label = placed ?? labelBox(art, el.offsetWidth, el.offsetHeight);
      return { label, box: area(art, label) };
    };

    const hide = (timeout = false) => {
      clearTimeout(timer);
      placed = null;
      setTimedOut(timeout);
      setShown(false);
    };
    const expire = () => hide(true);
    // The cursor on the label stops the clock; moving off it starts the HOLD over.
    const onLabelEnter = () => clearTimeout(timer);
    const onLabelLeave = () => {
      if (!placed) return;
      clearTimeout(timer);
      timer = window.setTimeout(expire, HOLD);
    };

    const update = () => {
      frame = 0;
      const el = ref.current;
      const now = current();
      const inside = !!now && x >= now.box.l && x <= now.box.r && y >= now.box.t && y <= now.box.b;
      if (!inside) {
        armed = true;
        if (placed) hide();
        return;
      }
      if (!armed || placed || !el || !now) return;
      armed = false;
      placed = now.label;
      el.style.transform = `translate(${Math.round(placed.l)}px, ${Math.round(placed.t)}px)`;
      setShown(true);
      timer = window.setTimeout(expire, HOLD);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      schedule();
    };
    // Leaving the window, resizing it or scrolling hides it at once; it shows again the next time
    // the cursor moves in the rectangle.
    const onLeave = () => {
      x = y = -1;
      armed = true;
      hide();
    };

    // For tuning: keeps the red rectangle on the hover area as the sculpture sways.
    let debug = 0;
    const drawArea = () => {
      debug = requestAnimationFrame(drawArea);
      const a = areaRef.current;
      if (!a) return;
      const now = current();
      a.style.display = now ? "block" : "none";
      if (!now) return;
      a.style.transform = `translate(${now.box.l}px, ${now.box.t}px)`;
      a.style.width = `${now.box.r - now.box.l}px`;
      a.style.height = `${now.box.b - now.box.t}px`;
    };
    if (SHOW_AREA) drawArea();

    const label = ref.current;
    label?.addEventListener("pointerenter", onLabelEnter);
    label?.addEventListener("pointerleave", onLabelLeave);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onLeave, { passive: true });
    window.addEventListener("resize", onLeave);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(debug);
      clearTimeout(timer);
      label?.removeEventListener("pointerenter", onLabelEnter);
      label?.removeEventListener("pointerleave", onLabelLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onLeave);
      window.removeEventListener("resize", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      {SHOW_AREA && (
        <div
          ref={areaRef}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-20 bg-red-500/15 ring-1 ring-red-500/60"
        />
      )}
      {/* Hidden from screen readers and the tab order: note 0 carries the same credit and link. */}
      <a
        ref={ref}
        href={ARTWORK}
        aria-hidden="true"
        tabIndex={-1}
        className={`fixed top-0 left-0 z-20 rounded-md bg-label/90 px-2.5 py-1 text-[12px] leading-snug whitespace-nowrap text-ink/65 ring-1 dark:text-ink/80 ring-ink/10 backdrop-blur-sm cursor-pointer transition-opacity ease-out ${
          shown
            ? "pointer-events-auto opacity-100 duration-75"
            : `pointer-events-none opacity-0 ${timedOut ? "duration-[113ms]" : "duration-75"}`
        }`}
      >
        Our tree of life, inspired by Calder’s <i>Mobile sur deux plans</i> (1962)
      </a>
    </>
  );
}
