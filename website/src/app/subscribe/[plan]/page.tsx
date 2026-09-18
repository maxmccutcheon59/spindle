import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubscribeClient } from "@/components/subscribe-client";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import type { PlanId } from "@/lib/site";

const allowed: PlanId[] = ["builder", "scale"];

export function generateStaticParams() {
  return allowed.map((plan) => ({ plan }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ plan: string }>;
}): Promise<Metadata> {
  const { plan } = await params;
  const title = plan === "scale" ? "Subscribe · Scale" : "Subscribe · Builder";
  return {
    title,
    robots: { index: false, follow: true },
  };
}

export default async function SubscribePlanPage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan } = await params;
  if (!allowed.includes(plan as PlanId)) notFound();

  return (
    <div>
      <SiteHeader />
      <main className="px-5 py-12 md:px-8 md:py-16">
        <SubscribeClient planId={plan as PlanId} />
      </main>
      <SiteFooter />
    </div>
  );
}
