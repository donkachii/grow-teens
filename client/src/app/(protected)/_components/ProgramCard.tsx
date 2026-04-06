/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";

interface CourseCardProps {
  id: number;
  image: string;
  title: string;
  description: string;
  programs?: any;
  statusType?: "PENDING" | "ACTIVE" | "COMPLETED";
  enrollDate?: string;
  onEnroll?: () => void;
}

const ProgramCard = ({
  image,
  title,
  description,
  id,
}: CourseCardProps) => {
  return (
    <Link href={`/dashboard/course/${id}`} className="cursor-pointer">
      <article className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
        <img
          src={image}
          alt={title}
          className="mb-4 h-[100px] w-full rounded-md object-cover"
        />

        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </article>
    </Link>
  );
};

export default ProgramCard;
