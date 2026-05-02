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
import type {
  CampaignStat,
  CampaignBranchStat,
} from '@features/vendor/types/dashboard';
import CampaignBranchesModal from './CampaignBranchesModal';

interface CampaignBarChartProps {
  data: CampaignStat[];
}

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export default function CampaignBarChart({
  data,
}: CampaignBarChartProps): React.JSX.Element {
  const [selectedCampaign, setSelectedCampaign] =
    React.useState<CampaignStat | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Sort data by revenue descending
  const originalSorted = [...data].sort((a, b) => b.revenue - a.revenue);

  let sortedData = originalSorted;
  if (originalSorted.length > 5) {
    const top5 = originalSorted.slice(0, 5);
    const othersRevenue = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.revenue, 0);
    const othersOrders = originalSorted
      .slice(5)
      .reduce((acc, curr) => acc + curr.orderCount, 0);

    const othersBranchesRaw = originalSorted
      .slice(5)
      .flatMap((curr) => curr.branches ?? []);

    const othersBranches = Array.from(
      othersBranchesRaw
        .reduce((map, branch) => {
          const existing = map.get(branch.branchId);
          if (existing) {
            map.set(branch.branchId, {
              ...existing,
              orderCount: existing.orderCount + branch.orderCount,
              revenue: existing.revenue + branch.revenue,
            });
          } else {
            map.set(branch.branchId, { ...branch });
          }
          return map;
        }, new Map<number, CampaignBranchStat>())
        .values()
    );

    sortedData = [
      ...top5,
      {
        campaignId: -1,
        campaignName: 'Khác',
        revenue: othersRevenue,
        orderCount: othersOrders,
        branches: othersBranches,
      } as CampaignStat,
    ];
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredCampaigns = originalSorted.filter((c) =>
    c.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Hiệu quả chiến dịch
        </h3>
        <p className="text-sm text-gray-500">
          Doanh thu từ các chiến dịch đang tham gia
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:h-[320px] lg:flex-row">
        <div className="h-[300px] w-full lg:h-full lg:w-2/3">
          {sortedData.length === 0 ? (
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
                  tickFormatter={(value) =>
                    `${(value / 1000).toLocaleString()}k`
                  }
                />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  content={({ active, payload, label }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload as CampaignStat;
                      return (
                        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                          <p className="mb-2 font-medium text-gray-900">
                            {label}
                          </p>
                          <div className="flex flex-col gap-1 text-sm">
                            <p className="text-gray-600">
                              Doanh thu:{' '}
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(data.revenue)}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Số đơn hàng:{' '}
                              <span className="font-semibold text-gray-900">
                                {data.orderCount}
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
                  dataKey="revenue"
                  name="Doanh thu"
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
        {originalSorted.length > 0 && (
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
                        onClick={() => setSelectedCampaign(campaign)}
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

      {selectedCampaign?.branches && (
        <CampaignBranchesModal
          open={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          campaignName={selectedCampaign.campaignName}
          branches={selectedCampaign.branches}
        />
      )}
    </div>
  );
}
