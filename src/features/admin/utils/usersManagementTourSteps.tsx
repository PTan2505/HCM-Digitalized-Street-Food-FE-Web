import type { Step } from 'react-joyride';

interface UsersManagementTourConfig {
  hasRows: boolean;
  isUserRolePage: boolean;
}

const USERS_TOUR_ID = 'admin-users';

export const getUsersManagementTourSteps = ({
  hasRows,
  isUserRolePage,
}: UsersManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="users-page-header"]',
      title: 'Tổng quan quản lý người dùng',
      content: 'Đây là nơi quản trị tài khoản khách hàng, đối tác và hệ thống.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="users-search-wrapper"]',
      title: 'Tìm kiếm người dùng',
      content: 'Nhập từ khóa để tìm nhanh tài khoản cần quản lý.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="users-table-wrapper"]',
      title: 'Danh sách người dùng',
      content: 'Bảng hiển thị thông tin và trạng thái tài khoản.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="users-table-wrapper"]',
        title: 'Chưa có dữ liệu',
        content: 'Không có người dùng phù hợp với bộ lọc hiện tại.',
        placement: 'top',
      },
    ];
  }

  if (!isUserRolePage) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="users-pagination"]',
        title: 'Phân trang người dùng',
        content: 'Điều chỉnh trang và số bản ghi mỗi trang tại đây.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-action="${USERS_TOUR_ID}:toggle-ban"]`,
      title: 'Chặn hoặc bỏ chặn',
      content: 'Dùng thao tác này để thay đổi trạng thái tài khoản khách hàng.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${USERS_TOUR_ID}:promote-moderator"]`,
      title: 'Thêm Moderator',
      content: 'Nâng quyền khách hàng thành moderator ngay tại bảng.',
      placement: 'left',
    },
    {
      target: '[data-tour="users-pagination"]',
      title: 'Phân trang người dùng',
      content: 'Điều chỉnh trang và số bản ghi mỗi trang tại đây.',
      placement: 'top',
    },
  ];
};
