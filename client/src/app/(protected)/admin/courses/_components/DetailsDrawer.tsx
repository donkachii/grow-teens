import React from "react";
import Image from "next/image";
import { FiStar, FiClock, FiUser, FiPackage, FiEdit2 } from "react-icons/fi";
import { Course } from "@/types";
import { convertDate } from "@/utils/formatDate";
import { Drawer } from "@/components/ui/Overlay";

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course | null;
  handleEditCourse: (course: Course) => void;
}

const difficultyClasses: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-violet-100 text-violet-700",
  EXPERT: "bg-red-100 text-red-700",
};

const DetailsDrawer = ({
  isOpen,
  onClose,
  selectedCourse,
  handleEditCourse,
}: DetailsDrawerProps) => {
  const difficultyClass =
    difficultyClasses[selectedCourse?.difficulty || "BEGINNER"] ||
    "bg-slate-100 text-slate-700";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Course Details"
      widthClassName="w-full max-w-2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (selectedCourse) handleEditCourse(selectedCourse);
            }}
            disabled={!selectedCourse}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit Course
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="relative h-44 overflow-hidden rounded-3xl">
          <Image
            src={
              selectedCourse?.thumbnail ||
              "https://via.placeholder.com/800x180?text=No+Cover+Image"
            }
            alt={selectedCourse?.title || "Course details"}
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {selectedCourse?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedCourse?.isFeatured ? (
                <span className="rounded-full bg-amber-100 p-2 text-amber-600">
                  <FiStar className="h-4 w-4" />
                </span>
              ) : null}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedCourse?.isPublished
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {selectedCourse?.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Description
          </h3>
          <p className="leading-7 text-slate-600">
            {selectedCourse?.description || "No description yet."}
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Category</p>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
              {selectedCourse?.category?.name || "N/A"}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Difficulty</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyClass}`}>
              {selectedCourse?.difficulty || "BEGINNER"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Duration</p>
            <div className="flex items-center gap-2 text-slate-700">
              <FiClock className="h-4 w-4 text-orange-500" />
              <span>{selectedCourse?.durationHours || 0} hours</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Enrollments</p>
            <div className="flex items-center gap-2 text-slate-700">
              <FiUser className="h-4 w-4 text-blue-500" />
              <span>{selectedCourse?._count?.enrollments || 0}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Modules</p>
            <div className="flex items-center gap-2 text-slate-700">
              <FiPackage className="h-4 w-4 text-violet-500" />
              <span>{selectedCourse?._count?.modules || 0}</span>
            </div>
          </div>
        </div>

        {selectedCourse?.instructor ? (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Instructor
            </p>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                {selectedCourse.instructor.profileImage ? (
                  <Image
                    src={selectedCourse.instructor.profileImage}
                    alt={`${selectedCourse.instructor.firstName} ${selectedCourse.instructor.lastName}`}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  `${selectedCourse.instructor.firstName?.[0] || ""}${selectedCourse.instructor.lastName?.[0] || ""}`
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedCourse.instructor.firstName}{" "}
                  {selectedCourse.instructor.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  ID: {selectedCourse.instructor.id}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Created</p>
            <p className="text-slate-700">
              {convertDate(selectedCourse?.createdAt || "")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-500">Last Updated</p>
            <p className="text-slate-700">
              {convertDate(selectedCourse?.updatedAt || "")}
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default DetailsDrawer;
