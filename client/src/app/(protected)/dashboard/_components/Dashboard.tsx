/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { CSSProperties, ReactElement } from "react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import requestClient from "@/lib/requestClient";
import { NextAuthUserSession } from "@/types";

interface OverviewItem {
  id: number;
  title: string;
  value: string;
  icon: ReactElement;
  bgClassName: string;
  patternStyle: CSSProperties;
}

const Dashboard = () => {
  const [enrolled, setEnrolled] = useState<any[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const session = useSession();
  const sessionData = session.data as NextAuthUserSession;

  const fetchEnrolled = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get("/programs");

        if (!response.data) return;
        setEnrolled(response.data?.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    });
  }, [sessionData?.user?.token]);

  useEffect(() => {
    if (sessionData?.user) {
      fetchEnrolled();
    }
  }, [fetchEnrolled, sessionData]);

  const dailyTip =
    "Remember to take short breaks during study sessions to improve focus!";

  const overview: OverviewItem[] = [
    {
      id: 1,
      title: "Courses Enrolled",
      value: String(enrolled?.length || 0),
      icon: <FiBookOpen size={24} />,
      bgClassName: "bg-blue-50",
      patternStyle: {
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(66, 153, 225, 0.15) 0%, rgba(66, 153, 225, 0.05) 25%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(66, 153, 225, 0.15) 0%, transparent 50%)`,
      },
    },
    {
      id: 2,
      title: "Completed Modules",
      value: "0",
      icon: <FiCheckCircle size={24} />,
      bgClassName: "bg-green-50",
      patternStyle: {
        backgroundImage: `linear-gradient(135deg, rgba(72, 187, 120, 0.1) 25%, transparent 25%),
                  linear-gradient(225deg, rgba(72, 187, 120, 0.1) 25%, transparent 25%),
                  linear-gradient(45deg, rgba(72, 187, 120, 0.1) 25%, transparent 25%),
                  linear-gradient(315deg, rgba(72, 187, 120, 0.1) 25%, transparent 25%)`,
      },
    },
    {
      id: 3,
      title: "Upcoming Deadlines",
      value: "0",
      icon: <FiClock size={24} />,
      bgClassName: "bg-red-50",
      patternStyle: {
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(245, 101, 101, 0.05) 5px, rgba(245, 101, 101, 0.05) 10px)",
      },
    },
    {
      id: 4,
      title: "Mentorship Sessions",
      value: "1",
      icon: <FiUsers size={24} />,
      bgClassName: "bg-violet-50",
      patternStyle: {
        backgroundImage: `radial-gradient(circle at 90% 10%, rgba(159, 122, 234, 0.15) 0%, transparent 30%),
                  radial-gradient(circle at 10% 90%, rgba(159, 122, 234, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 50% 50%, rgba(159, 122, 234, 0.05) 0%, transparent 50%)`,
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => (
          <article
            key={item.id}
            className="relative overflow-hidden rounded-xl shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`absolute inset-0 ${item.bgClassName}`}
              style={item.patternStyle}
            />
            <div className="relative z-10 p-4">
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="text-gray-800">{item.icon}</span>
                <span>{item.title}</span>
              </div>
              <p className="text-3xl font-semibold text-gray-900 lg:text-5xl">
                {isPending && item.id === 1 ? "..." : item.value}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Daily Inspiration
        </h2>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-lg italic text-gray-700">{dailyTip}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Mentorship & Support
        </h2>
        <div className="rounded-lg bg-white p-4 shadow-md">
          <div className="flex items-center gap-4">
            <img
              src="https://bit.ly/kent-c-dodds"
              alt="John Doe"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-gray-900">Your Mentor: John Doe</p>
              <p className="text-sm text-gray-600">
                Next session: Today at 4 PM
              </p>
            </div>
          </div>
          <Button size="sm" className="mt-4">
            Join Session
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Community Feed
        </h2>
        <div className="rounded-lg bg-white p-4 shadow-md">
          <p className="text-gray-700">
            This is a placeholder for the community feed where you can see
            posts, discussions, and shared resources from fellow GrowTeens
            users.
          </p>
          <Button variant="secondary" size="sm" className="mt-4">
            View More
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Additional Resources
        </h2>
        <div className="flex flex-col gap-4">
          <Button variant="primary" size="sm" className="w-fit">
            Help & Support
          </Button>
          <Button variant="secondary" size="sm" className="w-fit">
            Resource Library
          </Button>
          <Button variant="outline" size="sm" className="w-fit">
            Sponsorship Opportunities
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
