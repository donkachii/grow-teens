import type { Metadata } from "next";
import DashboardNavbar from "../_components/DashboardNavbar";
import SideBar from "./_components/SideBar";
import config from "@/lib/config";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextAuthUserSession } from "@/types";
import { authOptions } from "@/lib/auth";

const appName = config.appName;

export const metadata: Metadata = {
  title: `Admin | ${appName}`,
  description: "10MG Vendor Dashboard",
};

export default async function VendorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: NextAuthUserSession = (await getServerSession(authOptions))!;
  if (!session) redirect("/auth/signin");
  if (session.user?.role !== "ADMIN") redirect("/");
  
  return (
    <>
      <DashboardNavbar />
      <SideBar />
      <main className="lg:pl-72 lg:pt-[98px] bg-[#F9FAFB]">
        <div className="min-h-[calc(100vh-150px)]">
          {children}
        </div>
        {/* <Footer /> */}
      </main>
    </>
  );
}
