import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Syne } from "next/font/google";
import { AgentFab } from "@/components/agent-fab";
import { site } from "@/lib/site";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — by ${site.author.name}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.product,
  keywords: [...site.keywords],
  authors: [{ name: site.author.name, url: site.author.github }],
  creator: site.author.name,
  publisher: site.author.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: `${site.name} by ${site.author.name}`,
    title: `${site.name} — by ${site.author.name}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — by ${site.author.name}`,
    description: site.description,
    creator: `@${site.author.handle}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.product,
    alternateName: site.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    programmingLanguage: "Rust",
    description: site.description,
    url: site.url,
    codeRepository: site.github,
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Person",
      name: site.author.name,
      url: site.author.github,
      email: site.author.email,
      jobTitle: site.author.role,
    },
    offers: [
      { "@type": "Offer", name: "Open Source", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Builder", price: "49", priceCurrency: "USD" },
      { "@type": "Offer", name: "Scale", price: "149", priceCurrency: "USD" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.author.name,
    url: site.author.github,
    email: site.author.email,
    jobTitle: site.author.role,
    sameAs: [site.author.github, site.github],
  },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-sans`}
      >
        <div className="grain" aria-hidden />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <AgentFab />
      </body>
    </html>
  );
}
