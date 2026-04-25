import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendItem {
  value: number;
  isPositive: boolean;
  label?: string;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
  }>;
  /** Một trend duy nhất */
  trend?: TrendItem;
  /** Nhiều trend (dùng khi cần hiển thị nhiều chỉ số riêng biệt) */
  trends?: TrendItem[];
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
  subtitle,
  icon: Icon,
  trend,
  trends,
}: SummaryCardProps): React.JSX.Element {
  const allTrends: TrendItem[] = trends ?? (trend ? [trend] : []);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* Top: title + icon */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1 pr-3">
          <p className="mb-2 text-sm font-semibold tracking-wide text-gray-500">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>
        </div>
        <div className="bg-primary-100 text-primary-700 group-hover:bg-primary-600 shrink-0 rounded-2xl p-3.5 shadow-sm transition-colors group-hover:text-white">
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>

      {/* Bottom: trends / subtitle — always rendered so height stays consistent */}
      <div className="mt-5 flex min-h-[2rem] flex-col gap-1">
        {subtitle && (
          <p className="text-sm font-medium text-gray-500">{subtitle}</p>
        )}
        {allTrends.length > 0 ? (
          allTrends.map((t, i) => <TrendBadge key={i} item={t} />)
        ) : (
          /* placeholder invisible để giữ chiều cao đồng đều */
          <span className="invisible text-xs">–</span>
        )}
      </div>
    </div>
  );
}
