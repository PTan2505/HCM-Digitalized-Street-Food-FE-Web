import type { Step } from 'react-joyride';

interface OrderManagementTourConfig {
  hasRows: boolean;
}

const ORDER_TOUR_ID = 'vendor-order';

export const getOrderManagementTourSteps = ({
  hasRows,
}: OrderManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="order-page-header"]',
      title: 'Tổng quan quản lý đơn hàng',
      content: 'Đây là nơi theo dõi và xử lý đơn hàng theo từng chi nhánh.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="order-branch-filter"]',
      title: 'Lọc theo chi nhánh',
      content: 'Chọn một chi nhánh cụ thể hoặc xem tất cả đơn hàng.',
      placement: 'left',
    },
    {
      target: '[data-tour="order-completion-panel"]',
      title: 'Xác minh hoàn tất đơn',
      content: 'Nhập mã xác minh để hoàn tất đơn hàng đã được chấp nhận.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="order-table-wrapper"]',
      title: 'Danh sách đơn hàng',
      content: 'Bảng hiển thị món, tổng tiền, trạng thái và thời gian tạo đơn.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="order-table-wrapper"]',
        title: 'Chưa có đơn hàng',
        content: 'Hiện chưa có đơn hàng phù hợp với bộ lọc đang chọn.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${ORDER_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng đơn hàng',
      content: 'Mỗi dòng tương ứng một đơn để bạn xử lý nhanh.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action-trigger="${ORDER_TOUR_ID}"]`,
      title: 'Menu thao tác đơn hàng',
      content: 'Mở menu để xem chi tiết hoặc ra quyết định chấp nhận/từ chối.',
      placement: 'left',
      spotlightPadding: 8,
    },
    {
      target: '[data-tour="order-pagination"]',
      title: 'Phân trang đơn hàng',
      content: 'Điều hướng qua nhiều trang đơn hàng tại đây.',
      placement: 'top',
    },
  ];
};
