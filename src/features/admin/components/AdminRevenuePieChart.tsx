import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

interface AdminRevenuePieChartProps {
  branchAmount: number;
  campaignAmount: number;
  orderCommissionAmount: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  const radius =
    Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  // Chỉ hiển thị phần trăm nếu lớn hơn 0 để tránh đè chữ
  if ((percent ?? 0) === 0) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight="bold"
      fontSize={14}
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0];
    return (
      <div
        className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p className="text-sm">
          <span className="mr-2 font-medium text-gray-500">{data.name}:</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(Number(data.value) || 0)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminRevenuePieChart({
  branchAmount,
  campaignAmount,
  orderCommissionAmount,
}: AdminRevenuePieChartProps): React.JSX.Element {
  const data = [
    { name: 'Phí đăng ký chi nhánh', value: branchAmount, color: '#10B981' },
    {
      name: 'Phí chiến dịch hệ thống',
      value: campaignAmount,
      color: '#F59E0B',
    },
    {
      name: 'Hoa hồng đơn hàng',
      value: orderCommissionAmount,
      color: '#3B82F6',
    },
  ];

  const hasData =
    branchAmount > 0 || campaignAmount > 0 || orderCommissionAmount > 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Tỷ trọng doanh thu
        </h3>
        <p className="text-sm text-gray-500">Phân bổ nguồn thu nhập</p>
      </div>

      <div className="h-[350px] w-full">
        {!hasData ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2 text-2xl">💰</span>
            <span>Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                innerRadius={0}
                outerRadius={120}
                paddingAngle={0}
                dataKey="value"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={48}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: string, entry: any) => (
                  <span
                    className="ml-1 inline-flex flex-col"
                    style={{ verticalAlign: 'middle' }}
                  >
                    <span
                      style={{ color: entry.color }}
                      className="leading-tight font-medium"
                    >
                      {value}
                    </span>
                    <span
                      style={{ color: entry.color }}
                      className="mt-1 font-bold"
                    >
                      {formatCurrency(entry.payload.value)}
                    </span>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
