import { cn } from "@/lib/utils";

const variants = {
  approved: "bg-green-50 text-green-700",
  active: "bg-green-50 text-green-700",
  published: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  draft: "bg-gray-100 text-gray-600",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-red-50 text-red-700",
  banned: "bg-red-50 text-red-700",
};

export default function StatusBadge({ status }) {
  const variant = variants[status?.toLowerCase()] || "bg-gray-100 text-gray-600";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", variant)}>
      {status}
    </span>
  );
}
