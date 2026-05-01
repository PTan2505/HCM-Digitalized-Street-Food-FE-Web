import type { Step } from 'react-joyride';

interface CampaignOverviewTourConfig {
  hasRows: boolean;
}

const ADMIN_CAMPAIGN_TOUR_ID = 'admin-campaign';

export const getCampaignOverviewTourSteps = ({
  hasRows,
}: CampaignOverviewTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-campaign-page-header"]',
      title: 'Tổng quan chiến dịch hệ thống',
      content: 'Quản lý các chiến dịch khuyến mãi cấp hệ thống tại đây.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-campaign-create-button"]',
      title: 'Tạo chiến dịch',
      content:
        'Nhấn để thêm chiến dịch mới với mốc thời gian và phân khúc phù hợp.',
      placement: 'left',
    },
    {
      target: '[data-tour="admin-campaign-table-wrapper"]',
      title: 'Danh sách chiến dịch',
      content:
        'Bảng thể hiện thời gian diễn ra, thời gian đăng ký và trạng thái chiến dịch.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-campaign-table-wrapper"]',
        title: 'Chưa có chiến dịch',
        content:
          'Hiện chưa có chiến dịch nào. Bạn có thể tạo chiến dịch đầu tiên.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${ADMIN_CAMPAIGN_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chiến dịch',
      content: 'Mỗi dòng đại diện cho một chiến dịch trong hệ thống.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action-trigger="${ADMIN_CAMPAIGN_TOUR_ID}"]`,
      title: 'Menu thao tác chiến dịch',
      content:
        'Nhấn vào nút này để mở các thao tác chi tiết cho từng chiến dịch.',
      placement: 'left',
    },
  ];
};
