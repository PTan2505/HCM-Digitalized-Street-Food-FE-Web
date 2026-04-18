import type { Step } from 'react-joyride';

interface AdminBranchManagementTourConfig {
  hasRows: boolean;
}

const ADMIN_BRANCH_TOUR_ID = 'admin-branch';

export const getAdminBranchManagementTourSteps = ({
  hasRows,
}: AdminBranchManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-branch-page-header"]',
      title: 'Tổng quan quản lý chi nhánh',
      content:
        'Đây là nơi theo dõi trạng thái xác minh và hoạt động của chi nhánh.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-branch-table-wrapper"]',
      title: 'Danh sách chi nhánh',
      content:
        'Bảng hiển thị thông tin địa chỉ, trạng thái và ngày tạo chi nhánh.',
      placement: 'top',
    },
    {
      target: '[data-tour="admin-branch-pagination"]',
      title: 'Phân trang',
      content: 'Di chuyển giữa các trang để xem toàn bộ danh sách chi nhánh.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-branch-table-wrapper"]',
        title: 'Chưa có chi nhánh',
        content: 'Hiện chưa có chi nhánh nào trong hệ thống.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${ADMIN_BRANCH_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chi nhánh',
      content: 'Mỗi dòng là thông tin tóm tắt của một chi nhánh cụ thể.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${ADMIN_BRANCH_TOUR_ID}:view"]`,
      title: 'Xem chi tiết chi nhánh',
      content: 'Mở thông tin chi tiết để kiểm tra đầy đủ hồ sơ chi nhánh.',
      placement: 'left',
    },
  ];
};
