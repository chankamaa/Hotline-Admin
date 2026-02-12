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
    <div className="bg-white rounded-xl border border-blue-600 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-xs font-medium ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
