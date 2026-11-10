import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/* /robots.txt: everything may be crawled except the share image's capture page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/thumbnail" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
