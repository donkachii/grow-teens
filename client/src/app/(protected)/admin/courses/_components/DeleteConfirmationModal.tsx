import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { Course } from "@/types";
import { Modal } from "@/components/ui/Overlay";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course | null;
  handleDeleteCourse: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  selectedCourse,
  handleDeleteCourse,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={<span className="text-red-600">Delete Course</span>}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteCourse}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiTrash2 className="h-4 w-4" />
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-600">
        Are you sure you want to delete{" "}
        <strong className="text-slate-900">{selectedCourse?.title}</strong>?
        This action cannot be undone and will remove all associated content.
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
