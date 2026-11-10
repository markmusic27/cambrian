import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "./site";

const description = "A research workshop for people taking asymmetric bets in robot learning.";
// The page calls itself Cambrian; the tab and link previews use the fuller "Cambrian Robotics". (No
// separator in it: iMessage cuts "Cambrian | " or "Cambrian: " off a title, taking it for the site
// name when it matches the domain.)
const title = "Cambrian Robotics";

// The share image is app/opengraph-image.png (and twitter-image.png), a capture of app/thumbnail.
// Relative URLs here (and the share images') resolve against SITE_URL.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: "Cambrian", locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

// The page colors (--paper in app/globals.css), for the browser's own chrome.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0b" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The mobile toggles data-stacked on <html> after hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
      </head>
      <body className="bg-paper font-serif text-[15.5px] leading-[1.7] text-ink antialiased md:text-[16.5px]">
        {children}
      </body>
    </html>
  );
}
