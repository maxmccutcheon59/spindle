import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription confirmed",
  robots: { index: false, follow: false },
};

export default function SubscribeSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
