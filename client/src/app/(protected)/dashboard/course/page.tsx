/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Box, Grid, Heading, Text, useDisclosure } from "@chakra-ui/react";
import ProgramCard from "../../_components/ProgramCard";
import requestClient from "@/lib/requestClient";
import { useSession } from "next-auth/react";
import { NextAuthUserSession } from "@/types";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  // Fetch Courses from API
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

  const fetchEnrolledProgram = useCallback((userId: any) => {
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
  }, [sessionData?.user?.token]);

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
    onOpen();
  };

  const validEnrolledPrograms = enrolledProgram.filter(
    (program) => program?.program?.id
  );

  return (
    <Box p={6}>
      <Box pb={6}>
        <Heading size="lg" mb={6}>
          My Learning Path and Courses
        </Heading>

        {isPending ? (
          <Text>Loading courses...</Text>
        ) : (
          <>
            {enrollmentError && (
              <Text color="red.500" mb={4}>
                {enrollmentError}
              </Text>
            )}
            {!enrollmentError && enrolledProgram.length === 0 && (
              <Text>No enrolled programs available</Text>
            )}
            {!enrollmentError &&
              enrolledProgram.length > 0 &&
              validEnrolledPrograms.length === 0 && (
                <Text>No valid enrolled program data found.</Text>
              )}
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={6}
            >
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
            </Grid>
          </>
        )}
      </Box>

      <Box>
        <Heading size="lg" mb={6}>
          Featured Courses and Programs
        </Heading>

        {isPending ? (
          <Text>Loading courses...</Text>
        ) : (
          <>
            {courseError && (
              <Text color="red.500" mb={4}>
                {courseError}
              </Text>
            )}
            {!courseError && courses.length === 0 && <Text>No courses available</Text>}

            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={6}
            >
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
            </Grid>
          </>
        )}
      </Box>

      {/* Course Modal */}
      {selectedCourse && (
        <EnrollCourseModal
          isOpen={isOpen}
          onClose={onClose}
          selectedCourse={selectedCourse}
        />
      )}
    </Box>
  );
};

export default TeensCoursesPage;
