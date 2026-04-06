"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface Course {
  title: string;
  image: string;
  description: string;
}

interface EnrollCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course;
}

const EnrollCourseModal = ({
  isOpen,
  onClose,
  selectedCourse,
}: EnrollCourseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/50"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCourse.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <img
            src={selectedCourse.image}
            alt={selectedCourse.title}
            className="mx-auto mb-4 h-[120px] w-[120px] rounded-xl object-cover"
          />
          <p className="leading-7 text-gray-600">{selectedCourse.description}</p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-error-500 hover:bg-error-600"
            onClick={() => alert(`Enrolled in ${selectedCourse.title}`)}
          >
            Enroll Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollCourseModal;
