import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Verification | GrowTeens",
};

export default function SignUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
