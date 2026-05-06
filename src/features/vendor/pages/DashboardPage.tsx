import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Megaphone,
  Target,
  ShoppingCart,
} from 'lucide-react';
import useDashboard from '@features/vendor/hooks/useDashboard';
import SummaryCard from '@features/vendor/components/SummaryCard';
import RevenueLineChart from '@features/vendor/components/RevenueLineChart';
import DishBarChart from '@features/vendor/components/DishBarChart';
import VoucherBarChart from '@features/vendor/components/VoucherBarChart';
import CampaignBarChart from '@features/vendor/components/CampaignBarChart';
import BranchesPerformanceChart from '@features/vendor/components/BranchesPerformanceChart';
import VendorRevenueBarModal from '@features/vendor/components/VendorRevenueBarModal';
import { Tooltip } from '@mui/material';

export default function DashboardPage(): React.JSX.Element {
  const {
    revenue,
    vouchers,
    dishes,
    campaigns,
    branchesPerformance,
    onGetRevenue,
    onGetVouchers,
    onGetDishes,
    onGetCampaigns,
    onGetBranchesPerformance,
    status,
  } = useDashboard();

  const [showRevenueBarModal, setShowRevenueBarModal] = useState(false);

  // Default to the last 30 days which is a standard logical period for dashoards
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
    };
  });

  const [startDateInput, setStartDateInput] = useState(
    dateRange.fromDate.slice(0, 10)
  );
  const [endDateInput, setEndDateInput] = useState(
    dateRange.toDate.slice(0, 10)
  );

  useEffect(() => {
    const params = {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
    };
    onGetRevenue(params);
    onGetCampaigns(params);
    onGetVouchers(params);
    onGetDishes(params);
    onGetBranchesPerformance(params);
  }, [
    dateRange,
    onGetDishes,
    onGetRevenue,
    onGetVouchers,
    onGetCampaigns,
    onGetBranchesPerformance,
  ]);

  const handleFilterApply = (): void => {
    const start = new Date(startDateInput);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateInput);
    end.setHours(23, 59, 59, 999);

    setDateRange({
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
    });
  };

  const setQuickFilter = (days: number): void => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setStartDateInput(start.toISOString().slice(0, 10));
    setEndDateInput(end.toISOString().slice(0, 10));

    setDateRange({
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const makeTrend = (
    rate: number | null | undefined,
    label?: React.ReactNode
  ):
    | { value: number; isPositive: boolean; label?: React.ReactNode }
    | undefined => {
    if (rate == null) return undefined;
    return { value: Math.abs(rate), isPositive: rate >= 0, label };
  };

  const buildPeriodLabel = (
    previousPeriod: string | null | undefined
  ): React.ReactNode | undefined => {
    if (!previousPeriod) return undefined;

    // Check if it matches the format: từ [date1] tới [date2]
    const match = previousPeriod.match(/từ\s+(.*?)\s+tới\s+(.*)/i);
    if (match) {
      return (
        <span>
          so với cùng kỳ từ <span className="text-primary-600">{match[1]}</span>{' '}
          tới <span className="text-primary-600">{match[2]}</span>
        </span>
      );
    }

    return (
      <span>
        so với cùng kỳ <span className="text-red-500">{previousPeriod}</span>
      </span>
    );
  };

  const totalDishesSold =
    dishes?.topDishes?.reduce(
      (acc, curr) => acc + curr.totalQuantityOrdered,
      0
    ) ?? 0;

  return (
    <div className="font-(--font-nunito)">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Bảng điều khiển hoạt động
            </h1>
          </div>
          <p className="text-table-text-secondary text-sm">
            Giám sát doanh thu và hiệu suất kinh doanh của bạn
          </p>
        </div>
      </div>

      {/* Analytics Action Bar */}
      <div
        className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-100 p-5 shadow-sm"
        style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}
      >
        <div className="flex w-full flex-wrap items-end gap-4">
          <div className="w-full sm:w-48">
            <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Từ ngày
            </span>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="focus:ring-primary-600 w-full rounded-lg border border-[var(--color-primary-600)] bg-white px-3 py-[9px] text-sm text-gray-800 transition-all outline-none hover:border-[var(--color-primary-700)] focus:ring-1"
            />
          </div>
          <div className="w-full sm:w-48">
            <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Đến ngày
            </span>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="focus:ring-primary-600 w-full rounded-lg border border-[var(--color-primary-600)] bg-white px-3 py-[9px] text-sm text-gray-800 transition-all outline-none hover:border-[var(--color-primary-700)] focus:ring-1"
            />
          </div>

          <div className="mt-5 flex w-full self-end sm:w-auto">
            <button
              onClick={handleFilterApply}
              className="bg-primary-600 hover:bg-primary-700 flex items-center justify-center rounded-lg px-5 py-[0.625rem] text-sm font-semibold text-white transition-all hover:shadow-md"
            >
              Áp dụng
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 self-end lg:mt-0 lg:ml-auto">
            <button
              onClick={() => setQuickFilter(7)}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-[0.625rem] text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setQuickFilter(30)}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-[0.625rem] text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              30 ngày qua
            </button>
            <button
              onClick={() => setQuickFilter(90)}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-[0.625rem] text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              3 tháng qua
            </button>
          </div>
        </div>
      </div>

      {status === 'pending' && !revenue ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="border-primary-600 h-10 w-10 animate-spin rounded-full border-b-2"></div>
          <span className="text-sm font-medium text-gray-500">
            Đang đồng bộ dữ liệu...
          </span>
        </div>
      ) : (
        <div className="animate-in fade-in relative w-full space-y-8 duration-700">
          {/* Loading overlay for refetches */}
          {status === 'pending' && revenue !== null && (
            <div className="absolute inset-0 z-10 flex justify-center rounded-xl bg-white/50 pt-20 backdrop-blur-[1px]">
              <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
            <Tooltip
              title={
                <div className="pointer-events-auto flex min-w-[200px] flex-col gap-1.5 p-1.5">
                  <div className="mb-1 border-b border-gray-100 pb-2">
                    <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      Tổng doanh thu
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(revenue?.totalRevenue ?? 0)}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRevenueBarModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 mt-1 w-full rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-sm"
                  >
                    Xem chi tiết so sánh
                  </button>
                </div>
              }
              placement="bottom"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow:
                      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f3f4f6',
                    px: 1.5,
                    py: 1.5,
                    pointerEvents: 'auto',
                  },
                },
                arrow: {
                  sx: {
                    color: '#ffffff',
                    '&::before': { border: '1px solid #f3f4f6' },
                  },
                },
              }}
            >
              <div className="h-full">
                <SummaryCard
                  title="Tổng doanh thu"
                  value={formatCurrency(revenue?.totalRevenue ?? 0)}
                  icon={DollarSign}
                  trend={makeTrend(
                    revenue?.revenueGrowthRate,
                    buildPeriodLabel(revenue?.previousPeriod)
                  )}
                />
              </div>
            </Tooltip>
            <SummaryCard
              title="Tổng đơn hàng"
              value={revenue?.totalOrders ?? 0}
              icon={ShoppingBag}
              trend={makeTrend(
                revenue?.ordersGrowthRate,
                buildPeriodLabel(revenue?.previousPeriod)
              )}
            />
            <SummaryCard
              title="Tổng chiến dịch"
              value={campaigns?.totalCampaigns ?? 0}
              icon={Target}
            />
            <SummaryCard
              title="Doanh thu chiến dịch"
              value={formatCurrency(campaigns?.totalCampaignRevenue ?? 0)}
              icon={Megaphone}
            />
            <SummaryCard
              title="Đơn hàng từ chiến dịch"
              value={campaigns?.totalCampaignOrders ?? 0}
              icon={ShoppingCart}
            />
          </div>

          {/* Timeseries Revenue */}
          <div className="w-full">
            <RevenueLineChart data={revenue?.dailyRevenues ?? []} />
          </div>

          {/* Top Dishes */}
          <div className="w-full">
            <DishBarChart data={dishes?.topDishes ?? []} />
          </div>

          {/* Branches Performance */}
          <div className="w-full">
            <BranchesPerformanceChart
              data={branchesPerformance?.branches ?? []}
            />
          </div>

          {/* Campaign analytics */}
          <div className="w-full">
            <CampaignBarChart data={campaigns?.campaigns ?? []} />
          </div>

          {/* Voucher analytics */}
          <div className="w-full pb-12">
            <VoucherBarChart data={vouchers?.voucherUsages ?? []} />
          </div>
        </div>
      )}
      <VendorRevenueBarModal
        isOpen={showRevenueBarModal}
        onClose={() => setShowRevenueBarModal(false)}
      />
    </div>
  );
}
