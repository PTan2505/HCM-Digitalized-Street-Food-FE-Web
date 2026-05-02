import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
  }>;
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
}: SummaryCardProps): React.JSX.Element {
  return (
    <div className="group relative flex h-full flex-col justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="mb-1 truncate text-xs font-medium text-gray-500"
            title={title}
          >
            {title}
          </p>
          <h3
            className="truncate text-xl font-bold text-gray-900"
            title={String(value)}
          >
            {value}
          </h3>
        </div>
        <div className="bg-primary-50 text-primary-600 group-hover:bg-primary-600 shrink-0 rounded-xl p-2.5 transition-colors group-hover:text-white">
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
