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
    <div className="bg-white rounded-2xl border-2 border-blue-500 p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-1xl sm:text-1xl font-extrabold text-black">{value}</p>
        {change && (
          <p className={`text-xs sm:text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
