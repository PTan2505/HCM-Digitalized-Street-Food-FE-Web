import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendItem {
  value: number;
  isPositive: boolean;
  label?: React.ReactNode;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
  }>;
  trend?: TrendItem;
}

function TrendBadge({ item }: { item: TrendItem }): React.JSX.Element {
  const abs = Math.abs(item.value);
  const isNeutral = item.value === 0;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
          isNeutral
            ? 'bg-gray-100 text-gray-500'
            : item.isPositive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
        }`}
      >
        {isNeutral ? (
          <Minus size={11} strokeWidth={2.5} />
        ) : item.isPositive ? (
          <TrendingUp size={11} strokeWidth={2.5} />
        ) : (
          <TrendingDown size={11} strokeWidth={2.5} />
        )}
        {isNeutral
          ? '0%'
          : `${item.isPositive ? '+' : '-'}${abs.toFixed(2).replace(/\.?0+$/, '')}%`}
      </span>
      <span className="text-xs text-gray-400">
        {item.label ?? 'so với cùng kỳ'}
      </span>
    </div>
  );
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
}: SummaryCardProps): React.JSX.Element {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Top: title + value + icon */}
      <div className="flex items-start justify-between gap-3">
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

      {/* Bottom: trend — luôn chiếm chỗ để các card có chiều cao đồng đều */}
      <div className="mt-3 min-h-[1.5rem]">
        {trend ? (
          <TrendBadge item={trend} />
        ) : (
          <span className="invisible text-xs">–</span>
        )}
      </div>
    </div>
  );
}
