import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import AppModalHeader from '@components/AppModalHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useDashboard from '@features/admin/hooks/useDashboard';
import type { RevenueBarItem } from '@features/admin/types/dashboard';

interface AdminRevenueBarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'MONTH' | 'QUARTER';

const LABEL_MAP: Record<string, string> = {
  Previous: 'Kỳ Trước',
  Now: 'Kỳ Này',
};

function mapLabel(item: RevenueBarItem): RevenueBarItem {
  return { ...item, label: LABEL_MAP[item.label] ?? item.label };
}

export default function AdminRevenueBarModal({
  isOpen,
  onClose,
}: AdminRevenueBarModalProps): React.JSX.Element {
  const { adminRevenueBar, onGetAdminRevenueBar, revenueBarStatus } =
    useDashboard();
  const [filterType, setFilterType] = useState<FilterType>('MONTH');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedQuarter, setSelectedQuarter] =
    useState<number>(currentQuarter);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  useEffect(() => {
    if (isOpen) {
      handleApply();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleApply = (): void => {
    let fromDate: Date;
    let toDate: Date;

    if (filterType === 'MONTH') {
      fromDate = new Date(selectedYear, selectedMonth - 1, 1);
      toDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
    } else {
      const startMonth = (selectedQuarter - 1) * 3;
      fromDate = new Date(selectedYear, startMonth, 1);
      toDate = new Date(selectedYear, startMonth + 3, 0, 23, 59, 59, 999);
    }

    void onGetAdminRevenueBar({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const chartData = adminRevenueBar?.items.map(mapLabel) ?? [];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}
    >
      <AppModalHeader
        title="So sánh doanh thu"
        subtitle="Biểu đồ so sánh doanh thu hiện tại và kỳ trước"
        icon={<BarChartIcon />}
        iconTone="admin"
        onClose={onClose}
      />

      <DialogContent className="p-6">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Loại thời gian
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1"
            >
              <option value="MONTH">Theo tháng</option>
              <option value="QUARTER">Theo quý</option>
            </select>
          </div>

          {filterType === 'MONTH' ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                Tháng
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                Quý
              </label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1"
              >
                {quarters.map((q) => (
                  <option key={q} value={q}>
                    Quý {q}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Năm
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApply}
            className="bg-primary-600 hover:bg-primary-700 ml-auto rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-md active:scale-95"
          >
            Áp dụng
          </button>
        </div>

        {/* Chart */}
        <div className="relative h-80 w-full">
          {revenueBarStatus === 'pending' ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px]">
              <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : null}

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000)
                      return `${(value / 1000000).toFixed(1).replace(/\\.0$/, '')}tr`;
                    if (value >= 1000)
                      return `${(value / 1000).toFixed(1).replace(/\\.0$/, '')}k`;
                    return value;
                  }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow:
                      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [
                    formatCurrency(
                      typeof value === 'number' ? value : Number(value) || 0
                    ),
                    'Doanh thu',
                  ]}
                  labelStyle={{
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '4px',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              {revenueBarStatus !== 'pending' && 'Không có dữ liệu'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
