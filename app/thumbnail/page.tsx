import type { Metadata } from "next";
import { FIELD } from "@/components/field/config";
import Field from "@/components/field/Field";
import Mobile from "@/components/mobile/Mobile";

export const metadata: Metadata = { title: "Cambrian", robots: { index: false } };

/* The share image (app/opengraph-image.png) is a capture of this page: the mobile, still, at
   1200 × 630, over the page's contour background if FIELD.thumbnail.show, with the logo (the
   favicon, app/icon.svg) and the name in the top left corner. */
export default function Thumbnail() {
  return (
    <div className="relative h-[630px] w-[1200px] bg-paper">
      {FIELD.thumbnail.show && <Field still zoom={FIELD.thumbnail.zoom} />}
      <div className="relative z-10 h-full w-full">
        <Mobile thumbnail />
      </div>
      <div id="wordmark" className="absolute top-[48px] left-[46px] z-20 flex items-center gap-[14px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" width={56} height={56} className="relative -top-[5px] block" />
        <span className="text-[46px] leading-none tracking-[-0.02em] text-ink/90">Cambrian</span>
      </div>
    </div>
  );
}
