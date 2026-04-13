import type { Step } from 'react-joyride';

interface CampaignManagementTourConfig {
  hasRows: boolean;
}

const CAMPAIGN_TOUR_ID = 'vendor-campaign';

export const getCampaignManagementTourSteps = ({
  hasRows,
}: CampaignManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="campaign-page-header"]',
      title: 'Tổng quan quản lý chiến dịch',
      content: 'Đây là nơi quản lý các chiến dịch khuyến mãi của vendor.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="campaign-create-button"]',
      title: 'Thêm chiến dịch mới',
      content: 'Nhấn để tạo một chiến dịch mới cho cửa hàng.',
      placement: 'left',
    },
    {
      target: '[data-tour="campaign-join-button"]',
      title: 'Tham gia chiến dịch hệ thống',
      content: 'Mở danh sách chiến dịch hệ thống để tham gia nhanh.',
      placement: 'left',
    },
    {
      target: '[data-tour="campaign-table-wrapper"]',
      title: 'Danh sách chiến dịch',
      content:
        'Theo dõi thông tin chiến dịch, thời gian và trạng thái hoạt động.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="campaign-table-wrapper"]',
        title: 'Chưa có chiến dịch',
        content: 'Bạn chưa có chiến dịch cửa hàng nào trong danh sách.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${CAMPAIGN_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chiến dịch',
      content: 'Mỗi dòng là một chiến dịch để theo dõi nhanh thông tin.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: '[data-tour="campaign-pagination"]',
      title: 'Phân trang chiến dịch',
      content: 'Điều chỉnh số dòng mỗi trang và chuyển trang tại đây.',
      placement: 'top',
    },
  ];
};
