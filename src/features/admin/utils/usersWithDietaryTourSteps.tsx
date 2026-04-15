import type { Step } from 'react-joyride';

interface UsersWithDietaryTourConfig {
  hasRows: boolean;
}

export const getUsersWithDietaryTourSteps = ({
  hasRows,
}: UsersWithDietaryTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-user-dietary-page-header"]',
      title: 'Người dùng theo chế độ ăn',
      content: 'Theo dõi các nhóm người dùng theo chế độ ăn đặc biệt.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-user-dietary-table-wrapper"]',
      title: 'Danh sách người dùng',
      content: 'Bảng hiển thị tên người dùng và các chế độ ăn tương ứng.',
      placement: 'top',
    },
    {
      target: '[data-tour="admin-user-dietary-pagination"]',
      title: 'Phân trang',
      content: 'Di chuyển qua các trang để xem đầy đủ dữ liệu.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-user-dietary-table-wrapper"]',
        title: 'Chưa có dữ liệu',
        content: 'Hiện chưa có người dùng nào có thông tin chế độ ăn.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target:
        '[data-tour="admin-user-dietary-table-wrapper"] tbody tr[data-tour-row-index="0"]',
      title: 'Một dòng dữ liệu',
      content: 'Mỗi dòng là một người dùng với các tag chế độ ăn.',
      placement: 'top',
      spotlightPadding: 6,
    },
  ];
};
