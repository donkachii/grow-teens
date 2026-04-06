import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | GrowTeens",
};

export default function AboutUsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
