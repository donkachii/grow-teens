"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiEye, FiEyeOff, FiRefreshCw, FiDownload, FiUpload, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { canvasService, CanvasConfig, CanvasCourse, SyncLog } from "@/services/canvasService";
import { courseService } from "@/services/api";
import { Course, NextAuthUserSession } from "@/types";
import { handleServerErrorMessage } from "@/utils";

const statusClasses: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  RUNNING: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-slate-100 text-slate-700",
};

const buttonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

export default function CanvasIntegrationPage() {
  const { data: session } = useSession();
  const typedSession = session as NextAuthUserSession | null;
  const token = typedSession?.user?.token || "";

  const [config, setConfig] = useState<CanvasConfig | null>(null);
  const [configForm, setConfigForm] = useState({ domain: "", apiToken: "", accountId: "1" });
  const [showToken, setShowToken] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const [loadingCanvasCourses, setLoadingCanvasCourses] = useState(false);
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());

  const [gtCourses, setGtCourses] = useState<Course[]>([]);
  const [pushingIds, setPushingIds] = useState<Set<number>>(new Set());
  const [syncingEnrollIds, setSyncingEnrollIds] = useState<Set<number>>(new Set());

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const showToast = (
    title: string,
    description: string,
    status: "success" | "error" | "info"
  ) => {
    const message = description ? `${title}: ${description}` : title;
    if (status === "success") toast.success(message);
    else if (status === "error") toast.error(message);
    else toast.info(message);
  };

  const fetchConfig = useCallback(async () => {
    if (!token) return;
    try {
      const data = await canvasService.getConfig(token);
      setConfig(data);
      if (data.domain) {
        setConfigForm((f) => ({
          ...f,
          domain: data.domain || "",
          accountId: data.accountId || "1",
        }));
      }
    } catch {
      // not configured yet is fine
    }
  }, [token]);

  const fetchCanvasCourses = useCallback(async () => {
    if (!token || !config?.configured) return;
    setLoadingCanvasCourses(true);
    try {
      const res = await canvasService.getCanvasCourses(token);
      setCanvasCourses(res.data);
    } catch (err) {
      showToast("Error", handleServerErrorMessage(err), "error");
    } finally {
      setLoadingCanvasCourses(false);
    }
  }, [token, config?.configured]);

  const fetchGtCourses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await courseService.getAdminCourses(token, { limit: 100 });
      setGtCourses((res as any).courses || (res as any).data || []);
    } catch {
      // ignore
    }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoadingLogs(true);
    try {
      const res = await canvasService.getSyncLogs(token, { limit: 15 });
      setLogs(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config?.configured) {
      fetchCanvasCourses();
      fetchGtCourses();
      fetchLogs();
    }
  }, [config?.configured, fetchCanvasCourses, fetchGtCourses, fetchLogs]);

  const handleSaveConfig = async () => {
    if (!configForm.domain || !configForm.apiToken) {
      showToast("Validation", "Domain and API token are required", "error");
      return;
    }
    setSavingConfig(true);
    try {
      await canvasService.saveConfig(token, configForm);
      showToast("Connected", "Canvas configuration saved and verified", "success");
      await fetchConfig();
    } catch (err) {
      showToast("Connection failed", handleServerErrorMessage(err), "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleImportOne = async (course: CanvasCourse) => {
    setImportingIds((s) => new Set(s).add(course.id));
    try {
      const res = await canvasService.importCourses(token, { courseIds: [course.id] });
      showToast("Imported", res.message, "success");
      await Promise.all([fetchCanvasCourses(), fetchLogs()]);
    } catch (err) {
      showToast("Import failed", handleServerErrorMessage(err), "error");
    } finally {
      setImportingIds((s) => {
        const next = new Set(s);
        next.delete(course.id);
        return next;
      });
    }
  };

  const handleImportAll = async () => {
    setLoadingCanvasCourses(true);
    try {
      const res = await canvasService.importCourses(token);
      showToast("Import complete", res.message, "success");
      await Promise.all([fetchCanvasCourses(), fetchLogs()]);
    } catch (err) {
      showToast("Import failed", handleServerErrorMessage(err), "error");
    } finally {
      setLoadingCanvasCourses(false);
    }
  };

  const handlePushCourse = async (course: Course) => {
    setPushingIds((s) => new Set(s).add(course.id));
    try {
      const res = await canvasService.pushCourse(token, course.id);
      showToast("Pushed", res.message, "success");
      await Promise.all([fetchGtCourses(), fetchLogs()]);
    } catch (err) {
      showToast("Push failed", handleServerErrorMessage(err), "error");
    } finally {
      setPushingIds((s) => {
        const next = new Set(s);
        next.delete(course.id);
        return next;
      });
    }
  };

  const handleSyncEnrollments = async (course: Course) => {
    setSyncingEnrollIds((s) => new Set(s).add(course.id));
    try {
      const res = await canvasService.syncEnrollments(token, course.id);
      showToast("Enrollments synced", res.message, "success");
      await fetchLogs();
    } catch (err) {
      showToast("Sync failed", handleServerErrorMessage(err), "error");
    } finally {
      setSyncingEnrollIds((s) => {
        const next = new Set(s);
        next.delete(course.id);
        return next;
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Canvas LMS Integration</h1>
      <p className="mt-2 text-sm text-slate-500">
        Connect GrowTeens to your Canvas LMS instance to sync courses and enrollments.
      </p>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Canvas Configuration</h2>
        {config?.configured ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Connected to <strong>{config.domain}</strong> (account: {config.accountId})
          </div>
        ) : null}
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Canvas Domain
            </label>
            <input
              placeholder="myschool.instructure.com"
              value={configForm.domain}
              onChange={(e) =>
                setConfigForm((f) => ({ ...f, domain: e.target.value }))
              }
              className={inputClassName}
            />
          </div>

          <div className="max-w-[120px]">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Account ID
            </label>
            <input
              placeholder="1"
              value={configForm.accountId}
              onChange={(e) =>
                setConfigForm((f) => ({ ...f, accountId: e.target.value }))
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              API Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                placeholder="Canvas API access token"
                value={configForm.apiToken}
                onChange={(e) =>
                  setConfigForm((f) => ({ ...f, apiToken: e.target.value }))
                }
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                aria-label="Toggle token visibility"
                onClick={() => setShowToken((v) => !v)}
                className="absolute inset-y-0 right-3 my-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showToken ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className={`${buttonClassName} bg-blue-600 text-white hover:bg-blue-700`}
          >
            {savingConfig ? "Verifying..." : config?.configured ? "Update Configuration" : "Connect Canvas"}
          </button>
        </div>
      </section>

      {config?.configured ? (
        <>
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Canvas Courses</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleImportAll}
                  disabled={loadingCanvasCourses}
                  className={`${buttonClassName} border border-slate-200 text-slate-700 hover:bg-slate-50`}
                >
                  <FiDownload className="h-4 w-4" />
                  {loadingCanvasCourses ? "Importing..." : "Import All"}
                </button>
                <button
                  type="button"
                  onClick={fetchCanvasCourses}
                  disabled={loadingCanvasCourses}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <FiRefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadingCanvasCourses ? (
              <div className="py-10 text-center text-sm text-slate-500">Loading Canvas courses...</div>
            ) : canvasCourses.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No courses found in Canvas</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Canvas Course</th>
                      <th className="px-3 py-3 font-medium">Code</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Linked</th>
                      <th className="px-3 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {canvasCourses.map((cc) => (
                      <tr key={cc.id} className="border-b border-slate-100">
                        <td className="px-3 py-4 font-medium text-slate-900">{cc.name}</td>
                        <td className="px-3 py-4 text-slate-500">{cc.course_code}</td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              cc.workflow_state === "available"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {cc.workflow_state}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              cc.growTeensCourse
                                ? "bg-violet-100 text-violet-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {cc.growTeensCourse ? "Linked" : "Not linked"}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleImportOne(cc)}
                            disabled={importingIds.has(cc.id)}
                            className={`${buttonClassName} text-blue-600 hover:bg-blue-50`}
                          >
                            <FiDownload className="h-4 w-4" />
                            {importingIds.has(cc.id)
                              ? "Importing..."
                              : cc.growTeensCourse
                              ? "Re-import"
                              : "Import"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">GrowTeens Courses</h2>
            {gtCourses.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No courses found</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Course</th>
                      <th className="px-3 py-3 font-medium">Canvas Link</th>
                      <th className="px-3 py-3 font-medium">Published</th>
                      <th className="px-3 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gtCourses.map((course) => (
                      <tr key={course.id} className="border-b border-slate-100">
                        <td className="px-3 py-4 font-medium text-slate-900">{course.title}</td>
                        <td className="px-3 py-4">
                          {(course as any).canvasId ? (
                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                              Canvas ID: {(course as any).canvasId}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              Not pushed
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              course.isPublished
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handlePushCourse(course)}
                              disabled={pushingIds.has(course.id)}
                              className={`${buttonClassName} text-teal-700 hover:bg-teal-50`}
                            >
                              <FiUpload className="h-4 w-4" />
                              {pushingIds.has(course.id)
                                ? "Working..."
                                : (course as any).canvasId
                                ? "Update"
                                : "Push"}
                            </button>
                            {(course as any).canvasId ? (
                              <button
                                type="button"
                                onClick={() => handleSyncEnrollments(course)}
                                disabled={syncingEnrollIds.has(course.id)}
                                className={`${buttonClassName} text-orange-700 hover:bg-orange-50`}
                              >
                                <FiUsers className="h-4 w-4" />
                                {syncingEnrollIds.has(course.id)
                                  ? "Syncing..."
                                  : "Sync Enrollments"}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Sync History</h2>
              <button
                type="button"
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading logs...</div>
            ) : logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No sync operations yet</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Operation</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Records</th>
                      <th className="px-3 py-3 font-medium">Details</th>
                      <th className="px-3 py-3 font-medium">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100">
                        <td className="px-3 py-4 font-mono text-xs text-slate-700">
                          {log.operation}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusClasses[log.status] || statusClasses.PENDING
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-slate-600">{log.recordCount ?? "—"}</td>
                        <td className={`max-w-[300px] truncate px-3 py-4 text-xs ${log.error ? "text-red-500" : "text-slate-600"}`}>
                          {log.error || log.details || "—"}
                        </td>
                        <td className="px-3 py-4 text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
