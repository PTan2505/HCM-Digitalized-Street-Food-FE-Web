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
import type { TopDishes } from '@features/vendor/types/dashboard';

interface DishBarChartProps {
  data: TopDishes[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DishBarChart({
  data,
}: DishBarChartProps): React.JSX.Element {
  // Sort data by order quantity descending
  const originalSorted = [...data].sort(
    (a, b) => b.totalQuantityOrdered - a.totalQuantityOrdered
  );

  let sortedData = originalSorted;
  if (originalSorted.length > 5) {
    const top5 = originalSorted.slice(0, 5);
    const othersQuantity = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.totalQuantityOrdered, 0);
    sortedData = [
      ...top5,
      {
        dishId: -1,
        dishName: 'Khác',
        dishImage: '',
        totalQuantityOrdered: othersQuantity,
      } as TopDishes,
    ];
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top món ăn bán chạy
        </h3>
        <p className="text-sm text-gray-500">
          Món ăn được đặt nhiều nhất toàn hệ thống
        </p>
      </div>

      <div className="h-[300px] w-full">
        {sortedData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2">🍲</span>
            <span>Không có dữ liệu món ăn</span>
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
                dataKey="dishName"
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
                ) => [Number(value) || 0, 'Số lượng bán']}
              />
              <Bar
                dataKey="totalQuantityOrdered"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                animationDuration={1500}
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
