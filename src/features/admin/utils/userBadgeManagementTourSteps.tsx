import type { Step } from 'react-joyride';

interface UserBadgeManagementTourConfig {
  hasRows: boolean;
}

const ADMIN_USER_BADGE_TOUR_ID = 'admin-user-badge';

export const getUserBadgeManagementTourSteps = ({
  hasRows,
}: UserBadgeManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-user-badge-page-header"]',
      title: 'Tổng quan huy hiệu người dùng',
      content: 'Trang này giúp gán hoặc thu hồi huy hiệu cho từng người dùng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-user-badge-table-wrapper"]',
      title: 'Danh sách người dùng',
      content: 'Theo dõi huy hiệu hiện tại và tổng điểm của từng người dùng.',
      placement: 'top',
    },
    {
      target: '[data-tour="admin-user-badge-pagination"]',
      title: 'Phân trang',
      content: 'Di chuyển giữa các trang để quản lý toàn bộ người dùng.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-user-badge-table-wrapper"]',
        title: 'Chưa có người dùng',
        content: 'Hiện chưa có dữ liệu người dùng để quản lý huy hiệu.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${ADMIN_USER_BADGE_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng người dùng',
      content: 'Mỗi dòng thể hiện người dùng và danh sách huy hiệu đang có.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${ADMIN_USER_BADGE_TOUR_ID}:manage-badge"]`,
      title: 'Thêm hoặc thu hồi huy hiệu',
      content: 'Mở hộp thoại để gán hoặc thu hồi huy hiệu cho người dùng.',
      placement: 'left',
    },
  ];
};
