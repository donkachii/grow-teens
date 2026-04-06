/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import LoadingState from "@/app/(protected)/_components/LoadingState";
import requestClient from "@/lib/requestClient";
import { NextAuthUserSession } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = ({ params: paramsPromise }: PageProps) => {
  const [programId, setProgramId] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<any | null>(null);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const [enrollmentStatus, setEnrollmentStatus] = useState<any | null>(null);

  const session = useSession();
  const sessionData = session?.data as NextAuthUserSession;
  const userId = sessionData?.user?.id;

  useEffect(() => {
    paramsPromise.then((resolvedParams) => {
      setProgramId(resolvedParams.id);
    });
  }, [paramsPromise]);

  const fetchProgram = useCallback(async () => {
    if (!programId) return;
    setLoading(true);
    try {
      const response = await requestClient({
        token: sessionData?.user?.token,
      }).get(`/programs/${programId}`);
      if (response.status === 200) {
        setProgram(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course data.");
    } finally {
      setLoading(false);
    }
  }, [programId, sessionData?.user?.token]);

  const fetchEnrollmentStatus = useCallback(async () => {
    if (!programId) return;
    setLoading(true);
    try {
      const response = await requestClient({
        token: sessionData?.user?.token,
      }).get(`/enrollments/${userId}/${programId}`);
      setEnrollmentStatus(response.data);
    } catch (error) {
      console.error("Error fetching enrollment status:", error);
      toast.error("Error fetching enrollment status");
    } finally {
      setLoading(false);
    }
  }, [userId, programId, sessionData?.user?.token]);

  useEffect(() => {
    if (!userId || !sessionData || !programId) return;
    fetchEnrollmentStatus();
    fetchProgram();
  }, [userId, programId, fetchEnrollmentStatus, fetchProgram, sessionData]);

  const handleEnroll = () => {
    if (!userId || !programId) {
      toast.error("User or program is invalid.");
      return;
    }

    startTransition(async () => {
      try {
        await requestClient({ token: sessionData?.user?.token }).post(
          "/enrollments",
          {
            userId: userId,
            programId: Number(programId),
          }
        );
        fetchEnrollmentStatus();
        toast.success("You have successfully enrolled!");
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while enrolling.");
      }
    });
  };

  return (
    <div className="p-5">
      {loading ? (
        <LoadingState />
      ) : (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-auto w-5 text-gray-500" />
            <span className="text-sm text-gray-600">Back</span>
          </button>

          <div className="p-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {program?.title}
            </h1>
            <p className="mb-4 text-base text-gray-600">{program?.description}</p>

            {program?.image && (
              <img
                src={program?.image}
                alt={program?.title}
                className="mb-6 h-auto w-full rounded-md object-cover"
              />
            )}

            {enrollmentStatus?.enrolled ? (
              <div className="mb-6">
                <p className="mb-2 text-base text-success-600">
                  You are enrolled in this course.
                </p>
                {enrollmentStatus.enrollmentStatus === "ACTIVE" &&
                  enrollmentStatus.enrolledAt && (
                    <p className="text-sm text-gray-700">
                      Enrolled on:{" "}
                      {new Date(enrollmentStatus.enrolledAt).toLocaleDateString()}
                    </p>
                  )}
                {enrollmentStatus.enrollmentStatus === "COMPLETED" && (
                  <p className="text-sm text-secondary-600">Course Completed</p>
                )}
              </div>
            ) : (
              <Button
                className="mb-6 bg-error-500 hover:bg-error-600"
                onClick={handleEnroll}
                disabled={isPending}
              >
                {isPending ? "Enrolling..." : "Enroll Now"}
              </Button>
            )}

            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Course Modules
            </h2>
            {program?.modules && program?.modules.length > 0 ? (
              <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {program?.modules.map((module: any) => (
                  <button
                    type="button"
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-gray-600">{module.description}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No modules found.</p>
            )}

            {selectedModule && (
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                {JSON.parse(selectedModule.content).map((item: string, i: any) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
