import React, { useRef } from "react";
import { FaCamera } from "react-icons/fa6";

import { Button } from "@/components/ui/Button";

interface SessionData {
  user: {
    name: string;
    picture: string;
  };
}

interface ProfileImageUploaderProps {
  filePreview: string | null;
  sessionData: SessionData | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadProfileImage: () => void;
  isUploading: boolean;
  isShowUpload: boolean;
  fileError: string | null;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  filePreview,
  sessionData,
  handleFileChange,
  uploadProfileImage,
  isUploading,
  isShowUpload,
  fileError,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="group relative w-fit cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={filePreview ?? sessionData?.user?.picture}
          alt={sessionData?.user?.name ?? "Profile"}
          className="h-24 w-24 rounded-full object-cover"
        />
        <span className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 rounded-full bg-gray-600 p-1.5 text-white group-hover:block">
          <FaCamera className="h-[15px] w-[15px]" />
        </span>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          id="file-input"
        />
      </button>

      <div className="flex flex-col gap-3">
        <p className="text-base font-semibold text-gray-700">Profile Image</p>
        <p className="text-sm text-gray-700">Min 400x400px, PNG or JPEG</p>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={uploadProfileImage}
            disabled={!isShowUpload || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>

        <p className="text-xs text-red-500">{fileError}</p>
      </div>
    </div>
  );
};
