import React, { useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "react-toastify";

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxFileSize?: number;
  uploadLabel?: string;
  uploadSuccessMessage?: string;
}

const UploadFile: React.FC<FileUploadProps> = ({
  onUpload,
  accept = ".pdf, .doc, .docx, .csv, .xlsx, .xls",
  maxFileSize = 10 * 1024 * 1024,
  uploadLabel = "Click to upload or drag and drop",
  uploadSuccessMessage = "File uploaded successfully!",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const applyFile = (incomingFile: File) => {
    if (incomingFile.size > maxFileSize) {
      toast.error(
        `File size exceeds the ${(maxFileSize / 1024 / 1024).toFixed(
          2
        )}MB limit. Please upload a smaller file.`
      );
      setFile(null);
      return;
    }

    setFile(incomingFile);
    onUpload(incomingFile);
    toast.info(uploadSuccessMessage);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) applyFile(selectedFile);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) applyFile(droppedFile);
  };

  return (
    <div className="mb-6 space-y-5">
      <div className="mb-8">
        <div
          className="relative rounded-2xl border border-dashed border-gray-300 bg-white p-6 transition-colors hover:border-primary-300 hover:bg-primary-100/30"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex cursor-pointer flex-col gap-2">
            <div className="mx-auto mb-4 max-w-max rounded-full bg-gray-50 p-2">
              <FiUploadCloud className="h-6 w-6 text-gray-700" />
            </div>
            {file ? (
              <>
                <p className="text-center text-base text-gray-900">{file.name}</p>
                <p className="text-center text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <p className="text-center text-sm font-normal text-gray-700">
                  <span className="text-primary-500">Click to upload</span> or
                  drag and drop
                </p>
                <p className="text-center text-sm font-normal text-gray-600">
                  {uploadLabel}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
