import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Provider from "./provider";
import "./globals.css";
import GrowTeensLogo from "@public/icons/logo.svg";
import GrowTeensLogoThumbnailImage from "@public/icons/logo.svg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const appName = "GrowTeens";
// const appUrl = "";
const appMetaTitle = `${appName} - Empowering African Teens for a Brighter Future.`;
const imageAlt = 'GrowTeens Logo';
const appMetaDescription =
  "Empowering African Teens for a Brighter Future. #GrowTeens #Health #Education #Empowerment #Leadership #Mentorship";


export const metadata: Metadata = {
  title: appName,
  description: appMetaTitle,
  openGraph: {
    type: "website",
    title: appMetaTitle,
    description: appMetaDescription,
    images: [
      {
        url: GrowTeensLogoThumbnailImage.src,
        alt: imageAlt,
      },
    ],
  },
  icons: [
    {
      url: GrowTeensLogo.src,
      type: "image/png",
      sizes: "32x32",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
