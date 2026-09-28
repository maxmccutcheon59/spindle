import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Pricing was replaced by the Cloud waitlist; keep old links working.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function PricingRedirect() {
  redirect("/cloud/");
}
