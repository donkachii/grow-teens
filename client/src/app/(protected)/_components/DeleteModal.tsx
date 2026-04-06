import { Button } from "@/components/ui/Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  handleRequest: () => void;
  isLoading: boolean;
}

const DeleteModal = ({
  isOpen,
  onClose,
  title,
  handleRequest,
  isLoading,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete modal overlay"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/50"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-center text-xl font-semibold text-gray-900">
          Delete {title}
        </h3>
        <p className="mt-2 text-center text-sm text-gray-500">
          Are you sure you want to delete this {title}?
        </p>
        <div className="my-8 flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            className="bg-error-500 hover:bg-error-600"
            onClick={handleRequest}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
