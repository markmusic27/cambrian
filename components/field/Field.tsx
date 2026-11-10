"use client";

/*
 * The page's background field: faint contour lines behind the text and the sculpture.
 * draw-field.ts draws it; config.ts tunes it (FIELD.enabled turns it off).
 */

import { useEffect, useRef } from "react";
import { FIELD } from "./config";
import { runField } from "./draw-field";

/**
 * `still`: drawn once and held (the share image, app/thumbnail). `zoom`: drawn that many times
 * larger (draw-field.ts).
 */
export default function Field({ still = false, zoom = 1 }: { still?: boolean; zoom?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !FIELD.enabled) return;
    return runField(ref.current, { still, zoom });
  }, [still, zoom]);

  if (!FIELD.enabled) return null;
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
