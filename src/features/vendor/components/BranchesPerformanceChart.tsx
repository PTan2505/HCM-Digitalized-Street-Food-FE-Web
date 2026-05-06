import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { BranchPerformance } from '@features/vendor/types/dashboard';

interface BranchesPerformanceChartProps {
  data: BranchPerformance[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BranchesPerformanceChart({
  data,
}: BranchesPerformanceChartProps): React.JSX.Element {
  const [mode, setMode] = useState<'orderCount' | 'revenue'>('orderCount');

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const { sortedData, isShowingAll } = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (mode === 'orderCount') {
        return b.orderCount - a.orderCount;
      }
      return b.revenue - a.revenue;
    });

    // Keep all data if <= 5, otherwise take top 5 and create "Others"
    let displayed = sorted;
    const showingAll = sorted.length <= 5;

    if (!showingAll) {
      const top5 = sorted.slice(0, 5);
      if (mode === 'orderCount') {
        const othersOrderCount = sorted
          .slice(5)
          .reduce((acc, curr) => acc + curr.orderCount, 0);
        displayed = [
          ...top5,
          {
            branchId: -1,
            branchName: 'Khác',
            orderCount: othersOrderCount,
            revenue: sorted
              .slice(5)
              .reduce((acc, curr) => acc + curr.revenue, 0),
          },
        ];
      } else {
        const othersRevenue = sorted
          .slice(5)
          .reduce((acc, curr) => acc + curr.revenue, 0);
        displayed = [
          ...top5,
          {
            branchId: -1,
            branchName: 'Khác',
            orderCount: sorted
              .slice(5)
              .reduce((acc, curr) => acc + curr.orderCount, 0),
            revenue: othersRevenue,
          },
        ];
      }
    }

    return { sortedData: displayed, isShowingAll: showingAll };
  }, [data, mode]);

  // Calculate YAxis domain only for revenue mode to avoid overlapping ticks
  const yAxisDomain = useMemo(() => {
    if (mode === 'orderCount') {
      // Let Recharts auto-calculate domain for orderCount
      return undefined;
    }

    if (sortedData.length === 0) return [0, 1];

    const values = sortedData.map((item) => item.revenue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Add 20% padding to the top for revenue mode
    const padding = (maxValue - minValue) * 0.2 || maxValue * 0.2;
    return [0, Math.ceil((maxValue + padding) / 100) * 100];
  }, [sortedData, mode]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Hiệu suất chi nhánh
          </h3>
          <p className="text-sm text-gray-500">
            {isShowingAll ? 'Toàn bộ' : 'Top'} chi nhánh so sánh theo{' '}
            {mode === 'orderCount' ? 'số lượng đơn hàng' : 'doanh thu'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('orderCount')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === 'orderCount'
                ? 'bg-primary-600 text-white shadow-md'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Đơn hàng
          </button>
          <button
            onClick={() => setMode('revenue')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === 'revenue'
                ? 'bg-primary-600 text-white shadow-md'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Doanh thu
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {sortedData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2">🏪</span>
            <span>Không có dữ liệu chi nhánh</span>
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
                dataKey="branchName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value: string) => {
                  const maxLen = sortedData.length <= 3 ? 25 : 15;
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
                domain={yAxisDomain as [number, number] | undefined}
                tickFormatter={(value: number) => {
                  if (mode === 'revenue') {
                    if (value >= 1000000)
                      return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value) => {
                  if (value === undefined || value === null) return '';
                  const numValue = value as number;
                  if (mode === 'orderCount') {
                    return [numValue.toString(), 'Đơn hàng'];
                  }
                  return [formatCurrency(numValue), 'Doanh thu'];
                }}
                labelFormatter={(label) => {
                  if (!label) return '';
                  return `Chi nhánh: ${label}`;
                }}
              />
              <Bar
                dataKey={mode === 'orderCount' ? 'orderCount' : 'revenue'}
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
