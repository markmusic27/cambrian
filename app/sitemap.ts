import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/* /sitemap.xml: the one page. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/` }];
}
