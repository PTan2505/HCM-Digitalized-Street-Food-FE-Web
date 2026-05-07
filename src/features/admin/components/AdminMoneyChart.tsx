import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyAmount } from '@features/admin/types/dashboard';

interface AdminMoneyChartProps {
  data: DailyAmount[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyAmount; dataKey: string; color: string }>;
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
            <span className="mr-2 flex items-center text-gray-500">
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: '#10B981' }}
              ></span>
              Doanh thu từ đăng ký chi nhánh:
            </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(data.branchRegistrationAmount ?? 0)}
            </span>
          </p>
          <p className="text-sm">
            <span className="mr-2 flex items-center text-gray-500">
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: '#F59E0B' }}
              ></span>
              Doanh thu từ chiến dịch hệ thống:
            </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(data.systemCampaignAmount ?? 0)}
            </span>
          </p>
          <p className="text-sm">
            <span className="mr-2 flex items-center text-gray-500">
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: '#3B82F6' }}
              ></span>
              Doanh thu từ hoa hồng của đơn hàng:
            </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(data.orderCommissionAmount ?? 0)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminMoneyChart({
  data,
}: AdminMoneyChartProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Dòng tiền thu về
        </h3>
        <p className="text-sm text-gray-500">
          Thu nhập từ hệ thống (chi nhánh, chiến dịch, hoa hồng)
        </p>
      </div>

      <div className="h-[350px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2 text-2xl">💰</span>
            <span>Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                cursor={{
                  stroke: '#E5E7EB',
                  strokeWidth: 2,
                  strokeDasharray: '3 3',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#4B5563' }}
              />
              <Line
                type="monotone"
                name="Phí đăng ký chi nhánh"
                dataKey="branchRegistrationAmount"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                name="Phí tham gia chiến dịch"
                dataKey="systemCampaignAmount"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                name="Phí hoa hồng từ đơn hàng"
                dataKey="orderCommissionAmount"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
