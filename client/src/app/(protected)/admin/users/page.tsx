/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiSettings,
  FiMessageCircle,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiRefreshCw,
} from "react-icons/fi";
import requestClient from "@/lib/requestClient";
import { useSession } from "next-auth/react";
import { NextAuthUserSession } from "@/types";
import { handleServerErrorMessage } from "@/utils";
import { Modal } from "@/components/ui/Overlay";

interface UserPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ServerUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  profileImage?: string;
  lastActiveFormatted?: string;
  isOnline?: boolean;
  createdAtFormatted?: string;
}

interface UserResponse {
  users: ServerUser[];
  pagination: UserPagination;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

const badgeClassByRole: Record<string, string> = {
  TEEN: "bg-blue-100 text-blue-700",
  MENTOR: "bg-violet-100 text-violet-700",
  SPONSORS: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-slate-200 text-slate-700",
};

const UsersPage = () => {
  const { data: sessionData } = useSession() as {
    data: NextAuthUserSession | null;
  };

  const [users, setUsers] = useState<ServerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UserPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ServerUser | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "pending">("active");

  const fetchUsers = useCallback(
    async (page = 1) => {
      if (!sessionData?.user) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (searchQuery) queryParams.append("search", searchQuery);
        if (roleFilter) queryParams.append("role", roleFilter);
        if (statusFilter) queryParams.append("status", statusFilter);

        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get<UserResponse>(`/users?${queryParams.toString()}`);

        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (err) {
        const message = handleServerErrorMessage(err);
        setError(message);
        toast.error(message);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionData, searchQuery, roleFilter, statusFilter, pagination.limit]
  );

  const handleUpdateUserStatus = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await requestClient({ token: sessionData?.user?.token }).patch(
        `/users/${selectedUser.id}/status`,
        { status: newStatus }
      );

      toast.success(
        `User ${selectedUser.fullName} has been ${
          newStatus === "active" ? "activated" : "deactivated"
        }`
      );

      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(handleServerErrorMessage(err));
    } finally {
      setIsStatusDialogOpen(false);
      setSelectedUser(null);
    }
  }, [selectedUser, newStatus, sessionData, fetchUsers, pagination.page]);

  const handleUpdateUserRole = useCallback(
    async (userId: number, role: string) => {
      try {
        await requestClient({ token: sessionData?.user?.token }).patch(
          `users/${userId}/role`,
          { role }
        );

        toast.success(`User role has been updated to ${role}`);
        fetchUsers(pagination.page);
      } catch (err) {
        toast.error(handleServerErrorMessage(err));
      }
    },
    [sessionData, fetchUsers, pagination.page]
  );

  const openStatusDialog = (user: ServerUser, status: "active" | "pending") => {
    setSelectedUser(user);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  useEffect(() => {
    if (sessionData?.user) {
      fetchUsers(1);
    }
  }, [sessionData, fetchUsers, searchQuery, roleFilter, statusFilter]);

  const paginationPages = Array.from(
    { length: Math.min(5, pagination.totalPages) },
    (_, i) => {
      if (pagination.totalPages <= 5) return i + 1;
      if (pagination.page <= 3) return i + 1;
      if (pagination.page >= pagination.totalPages - 2) {
        return pagination.totalPages - 4 + i;
      }
      return pagination.page - 2 + i;
    }
  );

  return (
    <div className="px-6 py-8">
      <Modal
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        size="sm"
        title={`${newStatus === "active" ? "Activate" : "Deactivate"} User`}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsStatusDialogOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateUserStatus}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                newStatus === "active"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Confirm
            </button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to{" "}
          {newStatus === "active" ? "activate" : "deactivate"}{" "}
          <strong className="text-slate-900">{selectedUser?.fullName}</strong>?
          {newStatus === "active"
            ? " This will allow them to access the platform."
            : " This will prevent them from accessing the platform."}
        </p>
      </Modal>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[200px]">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClassName} pl-11`}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`${inputClassName} min-w-[150px] py-3`}
            >
              <option value="">All Roles</option>
              <option value="TEEN">Teens</option>
              <option value="MENTOR">Mentors</option>
              <option value="SPONSORS">Sponsors</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClassName} min-w-[150px] py-3`}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>

            <button
              type="button"
              onClick={() => fetchUsers(pagination.page)}
              disabled={isLoading}
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <FiRefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchUsers(1)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiRefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Active</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                user.fullName
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")
                                  .slice(0, 2)
                              )}
                              <span
                                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                                  user.isOnline ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              badgeClassByRole[user.role] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                user.emailVerified ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            />
                            {user.emailVerified ? "Active" : "Pending"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {user.lastActiveFormatted || "Never"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <details className="relative">
                              <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-violet-600 transition hover:bg-violet-50">
                                <FiUserCheck className="h-4 w-4" />
                              </summary>
                              <div className="absolute right-0 z-10 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                {["TEEN", "MENTOR", "SPONSORS", "ADMIN"].map((role) => (
                                  <button
                                    key={role}
                                    type="button"
                                    disabled={user.role === role}
                                    onClick={() => handleUpdateUserRole(user.id, role)}
                                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Set as {role === "SPONSORS" ? "Sponsor" : role.charAt(0) + role.slice(1).toLowerCase()}
                                  </button>
                                ))}
                              </div>
                            </details>

                            <button
                              type="button"
                              onClick={() =>
                                toast.info(
                                  `Message to ${user.fullName} will be implemented soon!`
                                )
                              }
                              className="rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50"
                              title="Message user"
                            >
                              <FiMessageCircle className="h-4 w-4" />
                            </button>

                            <details className="relative">
                              <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
                                <FiMoreVertical className="h-4 w-4" />
                              </summary>
                              <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                {!user.emailVerified ? (
                                  <button
                                    type="button"
                                    onClick={() => openStatusDialog(user, "active")}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                                    Activate Account
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openStatusDialog(user, "pending")}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <FiXCircle className="h-4 w-4 text-red-600" />
                                    Deactivate Account
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toast.info("User settings coming soon!")}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  <FiSettings className="h-4 w-4" />
                                  User Settings
                                </button>
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {users.length} of {pagination.total} users
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrevious}
                  onClick={() => fetchUsers(pagination.page - 1)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {paginationPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => fetchUsers(pageNum)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      pagination.page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!pagination.hasNext}
                  onClick={() => fetchUsers(pagination.page + 1)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default UsersPage;
