import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.url}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${site.url}/enterprise/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.99,
    },
    {
      url: `${site.url}/agent/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.98,
    },
    {
      url: `${site.url}/case-study/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.92,
    },
    {
      url: `${site.url}/pricing/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${site.url}/playground/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/about/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${site.url}/get-started/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${site.url}/design/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
