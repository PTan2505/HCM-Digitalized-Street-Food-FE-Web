import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyConversions } from '@features/admin/types/dashboard';

interface AdminConversionsChartProps {
  data: DailyConversions[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyConversions }>;
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
            <span className="mr-2 text-gray-500">Người bán mới:</span>
            <span className="font-bold text-emerald-600">
              {data.conversionCount ?? 0}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminConversionsChart({
  data,
}: AdminConversionsChartProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Chuyển đổi tài khoản
        </h3>
        <p className="text-sm text-gray-500">
          Lượng chuyển từ khách hàng thành người bán
        </p>
      </div>

      <div className="h-[350px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2 text-2xl">📈</span>
            <span>Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="conversionCount"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{
                  r: 6,
                  stroke: '#059669',
                  strokeWidth: 2,
                  fill: '#fff',
                }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
