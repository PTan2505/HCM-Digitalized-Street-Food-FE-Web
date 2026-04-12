import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailySignups } from '@features/admin/types/dashboard';

interface AdminSignupsChartProps {
  data: DailySignups[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailySignups }>;
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
            <span className="mr-2 text-gray-500">Lượt đăng ký:</span>
            <span className="font-bold text-blue-600">
              {data.signupCount ?? 0}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminSignupsChart({
  data,
}: AdminSignupsChartProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Đăng ký người dùng
        </h3>
        <p className="text-sm text-gray-500">Thống kê lượt đăng ký mới</p>
      </div>

      <div className="h-[350px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2 text-2xl">📊</span>
            <span>Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="signupCount"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSignups)"
                activeDot={{
                  r: 6,
                  stroke: '#2563EB',
                  strokeWidth: 2,
                  fill: '#fff',
                }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
