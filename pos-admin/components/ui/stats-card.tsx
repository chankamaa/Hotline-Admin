"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon }: StatsCardProps) {
  const changeColors = {
    increase: "text-green-600",
    decrease: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${changeColors[changeType]} mb-1`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
