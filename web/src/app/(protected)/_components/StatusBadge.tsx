import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  bgColor: string;
  color: string;
  isDot?: boolean;
}

const StatusBadge = ({ status, bgColor, color, isDot }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium"
      )}
      style={{ backgroundColor: bgColor }}
    >
      {!isDot && (
        <span
          className="inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span style={{ color }}>{status}</span>
    </span>
  );
};

export default StatusBadge;
