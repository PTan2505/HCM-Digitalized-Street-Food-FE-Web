import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VoucherUsages } from '@features/vendor/types/dashboard';

interface VoucherBarChartProps {
  data: VoucherUsages[];
}

export default function VoucherBarChart({
  data,
}: VoucherBarChartProps): React.JSX.Element {
  // Sort data descending by usageCount
  const originalSorted = [...data].sort((a, b) => b.usageCount - a.usageCount);

  let sortedData = originalSorted;
  if (originalSorted.length > 5) {
    const top5 = originalSorted.slice(0, 5);
    const othersUsage = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.usageCount, 0);
    sortedData = [
      ...top5,
      {
        voucherType: 'AMOUNT' as const,
        voucherName: 'Khác',
        usageCount: othersUsage,
      },
    ];
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Mức sử dụng Voucher
        </h3>
        <p className="text-sm text-gray-500">
          Các chương trình khuyến mãi phổ biến nhất
        </p>
      </div>

      <div className="h-[300px] w-full">
        {sortedData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2">🎟️</span>
            <span>Chưa có voucher nào được sử dụng</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="voucherName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value: string) => {
                  const maxLen =
                    sortedData.length <= 3
                      ? 30
                      : sortedData.length <= 5
                        ? 18
                        : 12;
                  return value.length > maxLen
                    ? value.substring(0, maxLen) + '...'
                    : value;
                }}
                dy={10}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(
                  value:
                    | number
                    | string
                    | readonly (string | number)[]
                    | undefined
                ) => [Number(value) || 0, 'Số lần sử dụng']}
                labelClassName="text-gray-900 font-medium mb-2"
              />
              <Bar
                dataKey="usageCount"
                fill="#8B5CF6"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
