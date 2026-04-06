import { NextAuthUserSession } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Dashboard from "./_components/Dashboard";

const AdminDashboard = async () => {
  await getServerSession(authOptions);

  return (
    <div className="p-8">
        <Dashboard />
    </div>
  );
};

export default AdminDashboard;
