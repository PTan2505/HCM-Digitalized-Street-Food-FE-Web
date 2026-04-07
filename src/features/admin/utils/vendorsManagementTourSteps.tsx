import type { Step } from 'react-joyride';

interface VendorsManagementTourConfig {
  hasRows: boolean;
}

const VENDORS_TOUR_ID = 'admin-vendors';

export const getVendorsManagementTourSteps = ({
  hasRows,
}: VendorsManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="vendors-page-header"]',
      title: 'Tổng quan quản lý cửa hàng',
      content: 'Đây là nơi quản trị danh sách cửa hàng trong hệ thống.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="vendors-table-wrapper"]',
      title: 'Danh sách cửa hàng',
      content: 'Bảng hiển thị trạng thái hoạt động và thông tin từng cửa hàng.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="vendors-table-wrapper"]',
        title: 'Chưa có cửa hàng',
        content: 'Hiện chưa có cửa hàng nào trong danh sách quản lý.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${VENDORS_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng cửa hàng',
      content: 'Mỗi dòng là một cửa hàng với trạng thái và ngày tạo.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${VENDORS_TOUR_ID}:view"]`,
      title: 'Xem chi tiết cửa hàng',
      content: 'Nhấn để mở thông tin chi tiết của cửa hàng.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${VENDORS_TOUR_ID}:toggle-active"]`,
      title: 'Tạm ngưng hoặc kích hoạt lại',
      content: 'Dùng nút này để thay đổi trạng thái hoạt động của cửa hàng.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${VENDORS_TOUR_ID}:delete"]`,
      title: 'Xóa cửa hàng',
      content: 'Dùng nút này để xóa cửa hàng khỏi hệ thống.',
      placement: 'left',
    },
    {
      target: '[data-tour="vendors-pagination"]',
      title: 'Phân trang',
      content: 'Dùng phân trang để duyệt nhanh danh sách cửa hàng.',
      placement: 'top',
    },
  ];
};
