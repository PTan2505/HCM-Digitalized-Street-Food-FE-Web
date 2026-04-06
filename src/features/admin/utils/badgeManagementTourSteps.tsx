import type { Step } from 'react-joyride';

interface BadgeManagementTourConfig {
  hasRows: boolean;
}

const BADGE_TOUR_ID = 'admin-badge';

export const getBadgeManagementTourSteps = ({
  hasRows,
}: BadgeManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="badge-page-header"]',
      title: 'Tổng quan quản lý huy hiệu',
      content: 'Đây là khu vực quản lý huy hiệu và điểm yêu cầu.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="badge-create-button"]',
      title: 'Thêm huy hiệu',
      content: 'Nhấn để tạo huy hiệu mới cho hệ thống.',
      placement: 'left',
    },
    {
      target: '[data-tour="badge-table-wrapper"]',
      title: 'Danh sách huy hiệu',
      content: 'Bảng hiển thị icon, tên, mô tả và điểm yêu cầu.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="badge-table-wrapper"]',
        title: 'Chưa có huy hiệu',
        content: 'Hiện chưa có huy hiệu nào. Hãy thêm huy hiệu đầu tiên.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${BADGE_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng huy hiệu',
      content: 'Mỗi dòng là một huy hiệu trong hệ thống.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${BADGE_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa huy hiệu',
      content: 'Dùng nút này để chỉnh sửa thông tin huy hiệu.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${BADGE_TOUR_ID}:delete"]`,
      title: 'Xóa huy hiệu',
      content: 'Dùng nút này để xóa huy hiệu đã chọn.',
      placement: 'left',
    },
  ];
};
