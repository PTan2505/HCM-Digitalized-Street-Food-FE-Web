import type { Step } from 'react-joyride';

interface OrderManagementTourConfig {
  hasRows: boolean;
}

const MANAGER_ORDER_TOUR_ID = 'manager-order';

export const getManagerOrderManagementTourSteps = ({
  hasRows,
}: OrderManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="manager-order-header"]',
      title: 'Tổng quan quản lý đơn hàng',
      content:
        'Đây là màn hình giúp bạn theo dõi và xử lý đơn hàng của chi nhánh đang quản lý.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="manager-order-completion-panel"]',
      title: 'Xác minh để hoàn tất đơn',
      content:
        'Bạn có thể nhập mã xác minh để hoàn tất nhanh các đơn đã được chấp nhận.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-order-table-wrapper"]',
      title: 'Bảng danh sách đơn hàng',
      content:
        'Bảng hiển thị thông tin đơn, trạng thái và các thao tác xử lý tương ứng.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="manager-order-table-wrapper"]',
        title: 'Chưa có dữ liệu đơn hàng',
        content:
          'Hiện chưa có đơn hàng để thao tác. Khi có đơn mới, bạn có thể chạy lại hướng dẫn để xem thêm các bước xử lý.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${MANAGER_ORDER_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Dòng dữ liệu đơn hàng',
      content:
        'Mỗi dòng đại diện cho một đơn hàng, bao gồm món ăn, hình thức nhận và trạng thái.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action-trigger="${MANAGER_ORDER_TOUR_ID}"]`,
      title: 'Menu thao tác nhanh',
      content:
        'Nhấn nút ba chấm để mở các thao tác như xem chi tiết, chấp nhận hoặc từ chối đơn. Từ màn hình chi tiết, bạn có thể nhập số bàn cho đơn tại chỗ khi cần.',
      placement: 'left',
      spotlightPadding: 8,
    },
    {
      target: '[data-tour="manager-order-pagination"]',
      title: 'Phân trang',
      content:
        'Khu vực này giúp bạn chuyển trang và điều chỉnh số lượng đơn hiển thị.',
      placement: 'top',
    },
  ];
};
