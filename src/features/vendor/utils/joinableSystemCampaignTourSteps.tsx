import type { Step } from 'react-joyride';

interface JoinableSystemCampaignTourConfig {
  hasRows: boolean;
  mode: 'join' | 'detail';
}

const JOINABLE_SYSTEM_CAMPAIGN_TOUR_ID = 'vendor-joinable-system-campaign';

export const getJoinableSystemCampaignTourSteps = ({
  hasRows,
  mode,
}: JoinableSystemCampaignTourConfig): Step[] => {
  const actionLabel = mode === 'detail' ? 'Chi tiết chiến dịch' : 'Tham gia';
  const actionDescription =
    mode === 'detail'
      ? 'Nhấn để xem thông tin chi tiết và phạm vi áp dụng của chiến dịch.'
      : 'Nhấn để tham gia chiến dịch hệ thống phù hợp với chi nhánh.';

  const baseSteps: Step[] = [
    {
      target: '[data-tour="joinable-system-campaign-header"]',
      title: 'Chiến dịch hệ thống khả dụng',
      content:
        'Đây là danh sách chiến dịch hệ thống mà vendor có thể theo dõi.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="joinable-system-campaign-table-wrapper"]',
      title: 'Danh sách chiến dịch',
      content: 'Bảng hiển thị tên chiến dịch, thời gian diễn ra và trạng thái.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="joinable-system-campaign-table-wrapper"]',
        title: 'Chưa có chiến dịch',
        content: 'Hiện chưa có chiến dịch hệ thống khả dụng để thao tác.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${JOINABLE_SYSTEM_CAMPAIGN_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chiến dịch',
      content: 'Mỗi dòng tương ứng một chiến dịch hệ thống cụ thể.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: '[data-tour="joinable-system-campaign-action"]',
      title: actionLabel,
      content: actionDescription,
      placement: 'left',
      spotlightPadding: 8,
    },
    {
      target: '[data-tour="joinable-system-campaign-pagination"]',
      title: 'Phân trang',
      content: 'Điều chỉnh trang và số dòng hiển thị trong modal tại đây.',
      placement: 'top',
    },
  ];
};
