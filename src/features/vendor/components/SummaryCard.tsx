import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
  }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: SummaryCardProps): React.JSX.Element {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* Decorative Blob */}
      {/* <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div> */}

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold tracking-wide text-gray-500">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>
        </div>
        <div className="bg-primary-100 text-primary-700 group-hover:bg-primary-600 rounded-2xl p-3.5 shadow-sm transition-colors group-hover:text-white">
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>

      {(subtitle !== undefined || trend !== undefined) && (
        <div className="relative z-10 mt-5">
          {subtitle && (
            <p className="text-sm font-medium text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : '-'}
                {trend.value}%
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {trend.label ?? 'so với kỳ trước'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
