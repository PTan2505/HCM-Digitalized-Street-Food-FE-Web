import type { Step } from 'react-joyride';

interface AdminVendorCampaignTourConfig {
  hasSelectedVendor: boolean;
  hasRows: boolean;
}

export const getAdminVendorCampaignTourSteps = ({
  hasSelectedVendor,
  hasRows,
}: AdminVendorCampaignTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-vendor-campaign-page-header"]',
      title: 'Tổng quan chiến dịch cửa hàng',
      content:
        'Trang này giúp Admin theo dõi chiến dịch được tạo từ các cửa hàng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-vendor-campaign-filters"]',
      title: 'Bộ lọc chiến dịch',
      content:
        'Lọc theo cửa hàng, từ khóa, trạng thái và mốc thời gian để tìm nhanh chiến dịch.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="admin-vendor-campaign-table"]',
      title: 'Danh sách chiến dịch',
      content: 'Bảng hiển thị các chiến dịch sau khi áp dụng bộ lọc hiện tại.',
      placement: 'top',
    },
  ];

  if (!hasSelectedVendor) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-vendor-campaign-filters"]',
        title: 'Chọn cửa hàng trước',
        content: 'Hãy chọn một cửa hàng để tải danh sách chiến dịch tương ứng.',
        placement: 'bottom',
      },
    ];
  }

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-vendor-campaign-table"]',
        title: 'Chưa có dữ liệu phù hợp',
        content:
          'Hiện chưa có chiến dịch khớp điều kiện lọc. Bạn có thể điều chỉnh bộ lọc để xem thêm dữ liệu.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target:
        '[data-tour="admin-vendor-campaign-table"] tbody tr[data-tour-row-index="0"]',
      title: 'Một dòng chiến dịch',
      content:
        'Mỗi dòng thể hiện thời gian, phân khúc và trạng thái chiến dịch.',
      placement: 'top',
      spotlightPadding: 6,
    },
  ];
};
