import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Checkout was removed; old subscribe links go to the Cloud waitlist.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export function generateStaticParams() {
  return [{ plan: "builder" }, { plan: "scale" }];
}

export const dynamicParams = false;

export default function SubscribeRedirect() {
  redirect("/cloud/");
}
