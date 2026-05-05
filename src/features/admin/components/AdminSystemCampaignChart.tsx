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
import type { SystemCampaignStatistics } from '@features/admin/types/dashboard';

interface AdminSystemCampaignChartProps {
  data: SystemCampaignStatistics[];
  loading: boolean;
  onViewDetail: (campaign: SystemCampaignStatistics) => void;
}

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export default function AdminSystemCampaignChart({
  data,
  loading,
  onViewDetail,
}: AdminSystemCampaignChartProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Sort data by totalBranchesJoined descending
  const originalSorted = [...data].sort(
    (a, b) => b.totalBranchesJoined - a.totalBranchesJoined
  );

  let sortedData = originalSorted;
  if (originalSorted.length > 5) {
    const top5 = originalSorted.slice(0, 5);
    const othersBranches = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.totalBranchesJoined, 0);
    const othersOrders = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.totalOrders, 0);

    sortedData = [
      ...top5,
      {
        campaignId: -1,
        campaignName: 'Khác',
        totalBranchesJoined: othersBranches,
        totalOrders: othersOrders,
      } as SystemCampaignStatistics,
    ];
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const filteredCampaigns = originalSorted.filter((c) =>
    c.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 lg:h-[320px] lg:flex-row">
      {/* Left side: Bar Chart */}
      <div className="h-[300px] w-full lg:h-full lg:w-2/3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <span className="mb-2">📊</span>
            <span>Không có dữ liệu chiến dịch</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="campaignName"
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
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const data = payload[0].payload as SystemCampaignStatistics;
                    return (
                      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                        <p className="mb-2 font-medium text-gray-900">
                          {label}
                        </p>
                        <div className="flex flex-col gap-1 text-sm">
                          <p className="text-gray-600">
                            Số lượng chi nhánh tham gia:{' '}
                            <span className="font-semibold text-blue-600">
                              {formatNumber(data.totalBranchesJoined)}
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Tổng đơn hàng:{' '}
                            <span className="font-semibold text-emerald-600">
                              {formatNumber(data.totalOrders)}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="totalBranchesJoined"
                name="Chi nhánh tham gia"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                animationDuration={1500}
              >
                {sortedData.map((_, index) => (
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

      {/* Right side: Clickable List */}
      {!loading && originalSorted.length > 0 && (
        <div className="flex h-[300px] w-full flex-col overflow-hidden rounded-xl border border-gray-100 lg:h-full lg:w-1/3">
          <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
            <div className="mb-2 text-sm font-semibold text-gray-700">
              Danh sách tham gia
            </div>
            <input
              type="text"
              placeholder="Tìm chiến dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 transition-colors outline-none placeholder:text-gray-400 focus:border-[var(--color-primary-600)] focus:ring-1 focus:ring-[var(--color-primary-600)]"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex flex-col gap-1">
              {filteredCampaigns.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Không tìm thấy chiến dịch
                </div>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const originalIdx = originalSorted.findIndex(
                    (c) => c.campaignId === campaign.campaignId
                  );
                  const color =
                    originalIdx < 5
                      ? COLORS[originalIdx % COLORS.length]
                      : '#9CA3AF'; // Khác (gray) cho những chiến dịch ngoài top 5
                  return (
                    <button
                      key={campaign.campaignId}
                      onClick={() => onViewDetail(campaign)}
                      className="group flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--color-primary-50)]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate text-sm font-medium text-gray-700 group-hover:text-[var(--color-primary-700)]">
                          {campaign.campaignName}
                        </span>
                      </div>
                      <span className="ml-2 shrink-0 text-xs font-semibold text-gray-500 group-hover:text-[var(--color-primary-600)]">
                        Chi tiết &rsaquo;
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
