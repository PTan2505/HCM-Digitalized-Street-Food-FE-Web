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
import type { DailyCompensation } from '@features/admin/types/dashboard';

interface AdminCompensationChartProps {
  data: DailyCompensation[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyCompensation }>;
  label?: string | null;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps): React.JSX.Element | null => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    const date = new Date(label as string);
    const dateStr = `Ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
        <p className="mb-2 font-medium text-gray-500">{dateStr}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="mr-2 text-gray-500">Mức bồi thường:</span>
            <span className="font-bold text-red-600">
              {formatCurrency(data.compensationAmount ?? 0)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminCompensationChart({
  data,
}: AdminCompensationChartProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Chi phí bồi thường
        </h3>
        <p className="text-sm text-gray-500">Thống kê chi phí bồi thường</p>
      </div>

      <div className="h-[350px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2 text-2xl">💸</span>
            <span>Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000)
                    return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(239,68,68,0.1)' }}
              />
              <Bar
                dataKey="compensationAmount"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
