import { NextAuthUserSession } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Dashboard from "./_components/Dashboard";

const TeenDashboard = async () => {
  const data: NextAuthUserSession | null = await getServerSession(authOptions);
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Dashboard />
    </div>
  );
};

export default TeenDashboard;
