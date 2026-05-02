import React from 'react';
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
import type { CampaignStat } from '@features/vendor/types/dashboard';

interface CampaignBarChartProps {
  data: CampaignStat[];
}

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export default function CampaignBarChart({
  data,
}: CampaignBarChartProps): React.JSX.Element {
  // Sort data by revenue descending
  const originalSorted = [...data].sort((a, b) => b.revenue - a.revenue);

  let sortedData = originalSorted;
  if (originalSorted.length > 5) {
    const top5 = originalSorted.slice(0, 5);
    const othersRevenue = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.revenue, 0);
    const othersOrders = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.orderCount, 0);
    sortedData = [
      ...top5,
      {
        campaignId: -1,
        campaignName: 'Khác',
        revenue: othersRevenue,
        orderCount: othersOrders,
      } as CampaignStat,
    ];
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Hiệu quả chiến dịch
        </h3>
        <p className="text-sm text-gray-500">
          Doanh thu từ các chiến dịch đang tham gia
        </p>
      </div>

      <div className="h-[300px] w-full">
        {sortedData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2">📊</span>
            <span>Không có dữ liệu chiến dịch</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="campaignName"
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
                tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
              />
              <Tooltip
                cursor={{ fill: '#F9FAFB' }}
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const data = payload[0].payload as CampaignStat;
                    return (
                      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                        <p className="mb-2 font-medium text-gray-900">
                          {label}
                        </p>
                        <div className="flex flex-col gap-1 text-sm">
                          <p className="text-gray-600">
                            Doanh thu:{' '}
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(data.revenue)}
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Số đơn hàng:{' '}
                            <span className="font-semibold text-gray-900">
                              {data.orderCount}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="revenue"
                name="Doanh thu"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                animationDuration={1500}
              >
                {sortedData.map((_, index) => (
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
