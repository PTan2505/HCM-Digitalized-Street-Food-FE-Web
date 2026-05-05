import React, { useEffect, useState } from 'react';
import { Tooltip } from '@mui/material';
import { Users, DollarSign, AlertCircle, UserCheck } from 'lucide-react';
import useDashboard from '@features/admin/hooks/useDashboard';
import SummaryCard from '@features/admin/components/SummaryCard';
import AdminSignupsChart from '@features/admin/components/AdminSignupsChart';
import AdminMoneyChart from '@features/admin/components/AdminMoneyChart';
import AdminCompensationChart from '@features/admin/components/AdminCompensationChart';
import AdminConversionsChart from '@features/admin/components/AdminConversionsChart';
import CompensationDetailModal from '@features/admin/components/CompensationDetailModal';
import SystemCampaignStatisticsModal from '@features/admin/components/SystemCampaignStatisticsModal';
import AdminSystemCampaignChart from '@features/admin/components/AdminSystemCampaignChart';
import type { SystemCampaignStatistics } from '@features/admin/types/dashboard';

export default function DashboardPage(): React.JSX.Element {
  const {
    userSignUps,
    money,
    compensation,
    conversions,
    systemCampaignsStatistics,
    status,
    onGetUserSignUps,
    onGetMoney,
    onGetCompensation,
    onGetConversions,
    onGetSystemCampaignsStatistics,
  } = useDashboard();

  // Default to the last 30 days which is a standard logical period for dashboards
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
    onGetUserSignUps({
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
    });
    onGetMoney({
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
    });
    onGetCompensation({
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
    });
    onGetConversions({
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
    });
    onGetSystemCampaignsStatistics();
  }, [
    dateRange,
    onGetUserSignUps,
    onGetMoney,
    onGetCompensation,
    onGetConversions,
    onGetSystemCampaignsStatistics,
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

  const [showCompensationDetail, setShowCompensationDetail] = useState(false);
  const [selectedCampaignStats, setSelectedCampaignStats] =
    useState<SystemCampaignStatistics | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const totalRevenue =
    (money?.totalBranchRegistrationAmount ?? 0) +
    (money?.totalSystemCampaignAmount ?? 0);

  const makeTrend = (
    rate: number | null,
    label?: string
  ): { value: number; isPositive: boolean; label?: string } | undefined => {
    if (rate === null) return undefined;
    return { value: Math.abs(rate), isPositive: rate >= 0, label };
  };

  const isInitialLoading =
    status === 'pending' &&
    !userSignUps &&
    !money &&
    !compensation &&
    !conversions;

  return (
    <div className="font-(--font-nunito)">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Bảng điều khiển hệ thống
            </h1>
          </div>
          <p className="text-table-text-secondary text-sm">
            Giám sát hiệu suất và các chỉ số tài chính của hệ thống
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

      {isInitialLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="border-primary-600 h-10 w-10 animate-spin rounded-full border-b-2"></div>
          <span className="text-sm font-medium text-gray-500">
            Đang đồng bộ dữ liệu...
          </span>
        </div>
      ) : (
        <div className="animate-in fade-in relative w-full space-y-8 duration-700">
          {/* Loading overlay for refetches */}
          {status === 'pending' && !isInitialLoading && (
            <div className="absolute inset-0 z-10 flex justify-center rounded-xl bg-white/50 pt-20 backdrop-blur-[1px]">
              <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          )}

          {/* Cards metrics */}
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Tooltip
              title={
                <div className="flex min-w-[220px] flex-col gap-1.5 p-1.5">
                  <div className="mb-1 border-b border-gray-100 pb-2">
                    <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      Chi tiết doanh thu
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Đăng ký chi nhánh
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(
                          money?.totalBranchRegistrationAmount ?? 0
                        )}
                      </span>
                    </div>
                    {money?.branchRegistrationGrowthRate != null && (
                      <span
                        className={`text-right text-xs font-medium ${
                          money.branchRegistrationGrowthRate >= 0
                            ? 'text-emerald-600'
                            : 'text-red-500'
                        }`}
                      >
                        {money.branchRegistrationGrowthRate > 0 ? '+' : ''}
                        {money.branchRegistrationGrowthRate}% so với kỳ trước
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        Chiến dịch hệ thống
                      </span>
                      <span className="text-sm font-bold text-amber-600">
                        {formatCurrency(money?.totalSystemCampaignAmount ?? 0)}
                      </span>
                    </div>
                    {money?.systemCampaignGrowthRate != null && (
                      <span
                        className={`text-right text-xs font-medium ${
                          money.systemCampaignGrowthRate >= 0
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}
                      >
                        {money.systemCampaignGrowthRate > 0 ? '+' : ''}
                        {money.systemCampaignGrowthRate}% so với kỳ trước
                      </span>
                    )}
                  </div>
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
                  },
                },
                arrow: {
                  sx: {
                    color: '#ffffff',
                    '&::before': {
                      border: '1px solid #f3f4f6',
                    },
                  },
                },
              }}
            >
              <div className="h-full cursor-pointer transition-transform hover:scale-[1.02]">
                <SummaryCard
                  title="Tổng doanh thu"
                  value={formatCurrency(totalRevenue)}
                  icon={DollarSign}
                  trends={
                    [
                      makeTrend(
                        money?.branchRegistrationGrowthRate ?? null,
                        'Đối với đăng ký chi nhánh'
                      ),
                      makeTrend(
                        money?.systemCampaignGrowthRate ?? null,
                        'Đối với chiến dịch hệ thống'
                      ),
                    ].filter(Boolean) as {
                      value: number;
                      isPositive: boolean;
                      label?: string;
                    }[]
                  }
                />
              </div>
            </Tooltip>
            <div
              className="cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => setShowCompensationDetail(true)}
            >
              <SummaryCard
                title="Chi phí bồi thường"
                value={formatCurrency(
                  compensation?.totalCompensationAmount ?? 0
                )}
                icon={AlertCircle}
                trend={makeTrend(compensation?.compensationGrowthRate ?? null)}
              />
            </div>
            <SummaryCard
              title="Người dùng đăng ký"
              value={userSignUps?.totalSignupCount ?? 0}
              icon={Users}
              trend={makeTrend(userSignUps?.signupGrowthRate ?? null)}
            />
            <SummaryCard
              title="Chuyển đổi người bán"
              value={conversions?.totalConversionCount ?? 0}
              icon={UserCheck}
              trend={makeTrend(conversions?.conversionGrowthRate ?? null)}
            />
          </div>

          {/* Money and Compensation */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdminMoneyChart data={money?.dailyAmounts ?? []} />
            <AdminCompensationChart
              data={compensation?.dailyCompensations ?? []}
            />
          </div>

          {/* Users metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdminSignupsChart data={userSignUps?.dailySignups ?? []} />
            <AdminConversionsChart data={conversions?.dailyConversions ?? []} />
          </div>

          {/* System Campaigns Statistics */}
          <div
            className="rounded-xl border border-gray-100 p-6 shadow-sm"
            style={{
              background: 'linear-gradient(to right, #ffffff, #f8fafc)',
            }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Thống kê chiến dịch hệ thống
              </h3>
              <p className="text-sm text-gray-500">
                Thông tin chi tiết về các chiến dịch hệ thống
              </p>
            </div>
            <AdminSystemCampaignChart
              data={systemCampaignsStatistics ?? []}
              loading={!systemCampaignsStatistics && status === 'pending'}
              onViewDetail={setSelectedCampaignStats}
            />
          </div>
        </div>
      )}
      <CompensationDetailModal
        open={showCompensationDetail}
        onClose={() => setShowCompensationDetail(false)}
        data={compensation?.compensationByVendors ?? []}
      />
      <SystemCampaignStatisticsModal
        open={selectedCampaignStats !== null}
        onClose={() => setSelectedCampaignStats(null)}
        data={selectedCampaignStats}
      />
    </div>
  );
}
