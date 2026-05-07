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
  Cell,
} from 'recharts';
import useDashboard from '@features/vendor/hooks/useDashboard';
import type { RevenueBarItem } from '@features/vendor/types/dashboard';

interface VendorRevenueBarModalProps {
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

const COLORS = ['#f87171', '#3b82f6']; // Red for Previous, Blue for Now

export default function VendorRevenueBarModal({
  isOpen,
  onClose,
}: VendorRevenueBarModalProps): React.JSX.Element {
  const { vendorRevenueBar, onGetVendorRevenueBar, revenueBarStatus } =
    useDashboard();
  const [filterType, setFilterType] = useState<FilterType>('MONTH');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedQuarter, setSelectedQuarter] =
    useState<number>(currentQuarter);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [isPreviousEnabled, setIsPreviousEnabled] = useState<boolean>(false);
  const [prevMonth, setPrevMonth] = useState<number>(
    currentMonth === 1 ? 12 : currentMonth - 1
  );
  const [prevQuarter, setPrevQuarter] = useState<number>(
    currentQuarter === 1 ? 4 : currentQuarter - 1
  );
  const [prevYear, setPrevYear] = useState<number>(
    currentMonth === 1 ? currentYear - 1 : currentYear
  );

  useEffect(() => {
    if (isOpen) {
      handleApply();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleApply = (): void => {
    const fromDate =
      filterType === 'MONTH'
        ? new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0))
        : new Date(
            Date.UTC(selectedYear, (selectedQuarter - 1) * 3, 1, 0, 0, 0, 0)
          );

    const toDate =
      filterType === 'MONTH'
        ? new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59, 999))
        : new Date(
            Date.UTC(
              selectedYear,
              (selectedQuarter - 1) * 3 + 3,
              0,
              23,
              59,
              59,
              999
            )
          );

    let previousFromDate: string | undefined;
    let previousToDate: string | undefined;

    if (isPreviousEnabled) {
      const pFrom =
        filterType === 'MONTH'
          ? new Date(Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0, 0))
          : new Date(Date.UTC(prevYear, (prevQuarter - 1) * 3, 1, 0, 0, 0, 0));

      const pTo =
        filterType === 'MONTH'
          ? new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999))
          : new Date(
              Date.UTC(prevYear, (prevQuarter - 1) * 3 + 3, 0, 23, 59, 59, 999)
            );

      previousFromDate = pFrom.toISOString();
      previousToDate = pTo.toISOString();
    }

    void onGetVendorRevenueBar({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      previousFromDate,
      previousToDate,
    });
  };

  const isInvalid = (): boolean => {
    if (!isPreviousEnabled) return false;
    if (filterType === 'MONTH') {
      return prevYear * 12 + prevMonth >= selectedYear * 12 + selectedMonth;
    }
    return prevYear * 4 + prevQuarter >= selectedYear * 4 + selectedQuarter;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const chartData = vendorRevenueBar?.items.map(mapLabel) ?? [];

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
        <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
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
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Current Period */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-bold text-gray-700">Kỳ này</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">
                    {filterType === 'MONTH' ? 'Tháng' : 'Quý'}
                  </label>
                  <select
                    value={
                      filterType === 'MONTH' ? selectedMonth : selectedQuarter
                    }
                    onChange={(e) =>
                      filterType === 'MONTH'
                        ? setSelectedMonth(Number(e.target.value))
                        : setSelectedQuarter(Number(e.target.value))
                    }
                    className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1"
                  >
                    {(filterType === 'MONTH' ? months : quarters).map((m) => (
                      <option key={m} value={m}>
                        {filterType === 'MONTH' ? `Tháng ${m}` : `Quý ${m}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">
                    Năm
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    placeholder="YYYY"
                    className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* Previous Period */}
            <div
              className={`space-y-3 rounded-lg border border-gray-200 bg-white p-4 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isPreviousEnabled ? 'bg-gray-400' : 'bg-gray-400'
                    }`}
                  ></div>
                  <span className={`text-sm font-bold text-gray-700`}>
                    Kỳ trước (Tùy chọn)
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isPreviousEnabled}
                    onChange={(e) => setIsPreviousEnabled(e.target.checked)}
                  />
                  <div className="peer peer-checked:bg-primary-600 peer-focus:ring-primary-300 h-5 w-9 rounded-full bg-gray-200 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">
                    {filterType === 'MONTH' ? 'Tháng' : 'Quý'}
                  </label>
                  <select
                    disabled={!isPreviousEnabled}
                    value={filterType === 'MONTH' ? prevMonth : prevQuarter}
                    onChange={(e) =>
                      filterType === 'MONTH'
                        ? setPrevMonth(Number(e.target.value))
                        : setPrevQuarter(Number(e.target.value))
                    }
                    className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1 disabled:bg-gray-100"
                  >
                    {(filterType === 'MONTH' ? months : quarters).map((m) => (
                      <option key={m} value={m}>
                        {filterType === 'MONTH' ? `Tháng ${m}` : `Quý ${m}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">
                    Năm
                  </label>
                  <input
                    type="number"
                    disabled={!isPreviousEnabled}
                    value={prevYear}
                    onChange={(e) => setPrevYear(Number(e.target.value))}
                    placeholder="YYYY"
                    className="hover:border-primary-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:ring-1 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="text-xs">
              {isInvalid() ? (
                <span className="font-medium text-red-500">
                  ⚠️ Kỳ trước phải xảy ra trước kỳ này
                </span>
              ) : (
                <span className="text-gray-400">
                  Nhấn "Áp dụng" để cập nhật dữ liệu biểu đồ
                </span>
              )}
            </div>
            <button
              onClick={handleApply}
              disabled={isInvalid() || revenueBarStatus === 'pending'}
              className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {revenueBarStatus === 'pending' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : null}
              Áp dụng
            </button>
          </div>
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
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {chartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
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
