"use client";

import React from "react";
import {
  FiUsers,
  FiBookOpen,
  FiUserCheck,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiSettings,
  FiBell,
  FiStar,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Metrics {
  id: number;
  title: string;
  value: string;
  icon: React.ReactElement;
  accentColor: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  panelClassName: string;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  icon: React.ReactElement;
  colorClassName: string;
  bgClassName: string;
}

const AdminDashboard = () => {
  const metricsOverview: Metrics[] = [
    {
      id: 1,
      title: "Total Users",
      value: "1,200",
      icon: <FiUsers className="h-6 w-6" />,
      accentColor: "text-blue-600",
      change: "+12%",
      trend: "up",
      panelClassName:
        "bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.18)_0%,rgba(59,130,246,0.05)_20%,transparent_50%),radial-gradient(circle_at_85%_60%,rgba(59,130,246,0.15)_0%,transparent_45%)] bg-blue-50",
    },
    {
      id: 2,
      title: "Active Courses",
      value: "35",
      icon: <FiBookOpen className="h-6 w-6" />,
      accentColor: "text-violet-600",
      change: "+5%",
      trend: "up",
      panelClassName:
        "bg-[linear-gradient(45deg,rgba(139,92,246,0.08)_25%,transparent_25%),linear-gradient(-45deg,rgba(139,92,246,0.08)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(139,92,246,0.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(139,92,246,0.08)_75%)] bg-[length:24px_24px] bg-violet-50",
    },
    {
      id: 3,
      title: "Pending Mentorships",
      value: "10",
      icon: <FiUserCheck className="h-6 w-6" />,
      accentColor: "text-emerald-600",
      change: "-2%",
      trend: "down",
      panelClassName:
        "bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(16,185,129,0.06)_4px,rgba(16,185,129,0.06)_8px),repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(16,185,129,0.06)_4px,rgba(16,185,129,0.06)_8px)] bg-emerald-50",
    },
    {
      id: 4,
      title: "Total Events",
      value: "5",
      icon: <FiCalendar className="h-6 w-6" />,
      accentColor: "text-orange-600",
      change: "+2",
      trend: "up",
      panelClassName:
        "bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.15)_0%,transparent_40%),radial-gradient(circle_at_30%_70%,rgba(249,115,22,0.1)_0%,transparent_35%)] bg-orange-50",
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      action: "New user registered",
      user: "Alex Johnson",
      timestamp: "Just now",
      icon: <FiUserCheck className="h-4 w-4" />,
      colorClassName: "text-emerald-600",
      bgClassName: "bg-emerald-100",
    },
    {
      id: 2,
      action: "New course published",
      user: "Admin",
      timestamp: "2 hours ago",
      icon: <FiBookOpen className="h-4 w-4" />,
      colorClassName: "text-blue-600",
      bgClassName: "bg-blue-100",
    },
    {
      id: 3,
      action: "User reported an issue",
      user: "Sarah Williams",
      timestamp: "Yesterday",
      icon: <FiAlertCircle className="h-4 w-4" />,
      colorClassName: "text-orange-600",
      bgClassName: "bg-orange-100",
    },
    {
      id: 4,
      action: "Mentorship request approved",
      user: "John Doe",
      timestamp: "2 days ago",
      icon: <FiCheckCircle className="h-4 w-4" />,
      colorClassName: "text-violet-600",
      bgClassName: "bg-violet-100",
    },
    {
      id: 5,
      action: "New event scheduled",
      user: "Admin",
      timestamp: "3 days ago",
      icon: <FiCalendar className="h-4 w-4" />,
      colorClassName: "text-teal-600",
      bgClassName: "bg-teal-100",
    },
  ];

  const userGrowthData = [
    { name: "Jan", users: 300 },
    { name: "Feb", users: 450 },
    { name: "Mar", users: 620 },
    { name: "Apr", users: 790 },
    { name: "May", users: 900 },
    { name: "Jun", users: 1050 },
    { name: "Jul", users: 1200 },
  ];

  const enrollmentData = [
    { name: "Tech Courses", value: 540 },
    { name: "Leadership", value: 320 },
    { name: "Entrepreneurship", value: 210 },
    { name: "Financial Literacy", value: 130 },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  const deviceUsageData = [
    { name: "Mobile", value: 65 },
    { name: "Desktop", value: 30 },
    { name: "Tablet", value: 5 },
  ];

  const DEVICE_COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const weeklyActivityData = [
    { day: "Mon", activity: 65 },
    { day: "Tue", activity: 59 },
    { day: "Wed", activity: 80 },
    { day: "Thu", activity: 81 },
    { day: "Fri", activity: 56 },
    { day: "Sat", activity: 40 },
    { day: "Sun", activity: 28 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Digital Skills Workshop",
      date: "April 15, 2025",
      attendees: 42,
    },
    {
      id: 2,
      title: "Leadership Conference",
      date: "April 22, 2025",
      attendees: 120,
    },
    {
      id: 3,
      title: "Mentorship Orientation",
      date: "May 1, 2025",
      attendees: 18,
    },
  ];

  const topCourses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      enrollments: 125,
      completion: 82,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Public Speaking for Teens",
      enrollments: 98,
      completion: 75,
      rating: 4.6,
    },
    {
      id: 3,
      title: "Financial Literacy 101",
      enrollments: 86,
      completion: 68,
      rating: 4.7,
    },
    {
      id: 4,
      title: "Mobile App Development",
      enrollments: 72,
      completion: 65,
      rating: 4.5,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <FiDownload className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <FiBell className="h-4 w-4" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Actions
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              {[
                { label: "Add New User", icon: <FiPlus className="h-4 w-4" /> },
                { label: "Create Course", icon: <FiBookOpen className="h-4 w-4" /> },
                { label: "Schedule Event", icon: <FiCalendar className="h-4 w-4" /> },
                { label: "Settings", icon: <FiSettings className="h-4 w-4" /> },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metricsOverview.map((metric) => (
          <article
            key={metric.id}
            className={`relative h-[150px] overflow-hidden rounded-3xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${metric.panelClassName}`}
          >
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full bg-white/70 p-3 ${metric.accentColor}`}
                  >
                    {metric.icon}
                  </div>
                  <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900">{metric.value}</p>
                <p
                  className={`mt-1 text-sm ${
                    metric.trend === "up"
                      ? "text-emerald-600"
                      : metric.trend === "down"
                      ? "text-red-500"
                      : "text-slate-500"
                  }`}
                >
                  {metric.change} from last month
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">User Growth</h2>
            <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500">
              <option value="30days">Last 30 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={userGrowthData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
              >
                <div
                  className={`rounded-full p-2 ${activity.bgClassName} ${activity.colorClassName}`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.action}</p>
                  <div className="mt-1 flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">by {activity.user}</p>
                    <p className="text-xs text-slate-400">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Course Distribution</h2>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {enrollmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Weekly Activity</h2>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyActivityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Device Usage</h2>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`
                  }
                >
                  {deviceUsageData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Top Performing Courses
            </h2>
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {topCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-slate-900">{course.title}</h3>
                  <div className="flex items-center gap-1 text-slate-700">
                    <FiStar className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Enrollments
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {course.enrollments}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Completion
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {course.completion}%
                    </p>
                  </div>
                  <div className="self-center">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${
                          course.completion >= 80
                            ? "bg-emerald-500"
                            : course.completion >= 60
                            ? "bg-blue-500"
                            : course.completion >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Schedule New
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{event.date}</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {event.attendees} attendees
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboard;
