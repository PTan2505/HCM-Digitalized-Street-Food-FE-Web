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
                tickFormatter={(value) =>
                  value.length > 15 ? value.substring(0, 15) + '...' : value
                }
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
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'Doanh thu')
                    return [formatCurrency(value), name];
                  return [value, name];
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
