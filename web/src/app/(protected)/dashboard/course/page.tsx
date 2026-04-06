/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";

import requestClient from "@/lib/requestClient";
import { NextAuthUserSession } from "@/types";
import ProgramCard from "../../_components/ProgramCard";
import EnrollCourseModal from "../_components/EnrollCourseModal";

interface Course {
  id: number;
  title: string;
  image: string;
  description: string;
  programs: string[];
  statusType: "PENDING" | "ACTIVE" | "COMPLETED";
  enrollDate?: string;
}

interface EnrollmentProgram {
  id: number;
  programId: number;
  statusType?: "PENDING" | "ACTIVE" | "COMPLETED";
  program?: Course | null;
}

const TeensCoursesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledProgram, setEnrolledProgram] = useState<EnrollmentProgram[]>(
    []
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const session = useSession();
  const sessionData = session.data as NextAuthUserSession;

  const fetchCourses = useCallback(() => {
    startTransition(async () => {
      try {
        setCourseError(null);
        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get("/programs");
        const programList = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        if (!response.data) {
          setCourses([]);
          setCourseError("No course data is available right now.");
          return;
        }

        setCourses(programList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setCourseError("Unable to load courses at the moment.");
      }
    });
  }, [sessionData?.user?.token]);

  const fetchEnrolledProgram = useCallback(
    (userId: any) => {
      startTransition(async () => {
        try {
          setEnrollmentError(null);
          const response = await requestClient({
            token: sessionData?.user?.token,
          }).get(`/enrollments/${userId}`);
          const enrollmentList = Array.isArray(response.data) ? response.data : [];

          if (!response.data) {
            setEnrolledProgram([]);
            setEnrollmentError("No enrollment data is available right now.");
            return;
          }

          setEnrolledProgram(enrollmentList);
        } catch (error) {
          console.error("Error fetching enrollments:", error);
          setEnrolledProgram([]);
          setEnrollmentError("Unable to load your enrolled programs right now.");
        }
      });
    },
    [sessionData?.user?.token]
  );

  useEffect(() => {
    if (sessionData?.user) {
      fetchCourses();
    }
  }, [fetchCourses, sessionData]);

  useEffect(() => {
    if (sessionData?.user) {
      fetchEnrolledProgram(Number(sessionData?.user?.id));
    }
  }, [fetchEnrolledProgram, sessionData]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsOpen(true);
  };

  const validEnrolledPrograms = enrolledProgram.filter(
    (program) => program?.program?.id
  );

  return (
    <div className="space-y-8 p-6">
      <section className="pb-2">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          My Learning Path and Courses
        </h1>

        {isPending ? (
          <p className="text-gray-600">Loading courses...</p>
        ) : (
          <>
            {enrollmentError && (
              <p className="mb-4 text-sm text-red-500">{enrollmentError}</p>
            )}
            {!enrollmentError && enrolledProgram.length === 0 && (
              <p className="text-gray-600">No enrolled programs available</p>
            )}
            {!enrollmentError &&
              enrolledProgram.length > 0 &&
              validEnrolledPrograms.length === 0 && (
                <p className="text-gray-600">No valid enrolled program data found.</p>
              )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {validEnrolledPrograms.map((program) => {
                const programData = program.program;

                if (!programData) return null;

                return (
                  <ProgramCard
                    key={program.id}
                    id={program.programId}
                    programs={program}
                    image={programData.image}
                    title={programData.title}
                    statusType={program.statusType}
                    description={programData.description}
                    onEnroll={() => handleCourseClick(programData)}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Featured Courses and Programs
        </h2>

        {isPending ? (
          <p className="text-gray-600">Loading courses...</p>
        ) : (
          <>
            {courseError && (
              <p className="mb-4 text-sm text-red-500">{courseError}</p>
            )}
            {!courseError && courses.length === 0 && (
              <p className="text-gray-600">No courses available</p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <ProgramCard
                  key={course.id}
                  id={course.id}
                  image={course.image}
                  title={course.title}
                  statusType={course.statusType}
                  enrollDate={course.enrollDate}
                  description={course.description}
                  onEnroll={() => handleCourseClick(course)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {selectedCourse && (
        <EnrollCourseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedCourse={selectedCourse}
        />
      )}
    </div>
  );
};

export default TeensCoursesPage;
