import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification | GrowTeens",
};

export default function VerificationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
