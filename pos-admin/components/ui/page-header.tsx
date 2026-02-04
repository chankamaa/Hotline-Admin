"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: ReactNode | {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
}

export function PageHeader({ title, subtitle, description, action }: PageHeaderProps) {
  const renderAction = () => {
    if (!action) return null;
    
    // If action is a ReactNode, render it directly
    if (typeof action !== 'object' || !('label' in action)) {
      return <div>{action}</div>;
    }
    
    // Otherwise render as a button
    const { label, onClick, icon: Icon, disabled } = action;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {Icon && <Icon size={18} />}
        {label}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {renderAction()}
    </div>
  );
}
