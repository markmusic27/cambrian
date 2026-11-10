import type { Metadata } from "next";
import { FIELD } from "@/components/field/config";
import Field from "@/components/field/Field";
import Mobile from "@/components/mobile/Mobile";

export const metadata: Metadata = { title: "Cambrian", robots: { index: false } };

/* The share image (app/opengraph-image.png) is a capture of this page: the mobile, still, over the
   page's contour background, at 1200 × 630. */
export default function Thumbnail() {
  return (
    <div className="h-[630px] w-[1200px] bg-paper">
      <Field still zoom={FIELD.thumbnailZoom} />
      <div className="relative z-10 h-full w-full">
        <Mobile thumbnail />
      </div>
    </div>
  );
}
