import type { Step } from 'react-joyride';

interface VoucherManagementTourConfig {
  hasRows: boolean;
}

const VOUCHER_TOUR_ID = 'admin-voucher';

export const getVoucherManagementTourSteps = ({
  hasRows,
}: VoucherManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="voucher-page-header"]',
      title: 'Tổng quan quản lý voucher',
      content: 'Đây là nơi quản trị voucher giảm giá trong hệ thống.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="voucher-create-button"]',
      title: 'Thêm voucher',
      content: 'Nhấn để tạo voucher mới.',
      placement: 'left',
    },
    {
      target: '[data-tour="voucher-table-wrapper"]',
      title: 'Danh sách voucher',
      content: 'Bảng hiển thị thông tin số lượng, thời gian và trạng thái.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="voucher-table-wrapper"]',
        title: 'Chưa có voucher',
        content: 'Hiện chưa có voucher nào trong hệ thống.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${VOUCHER_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng voucher',
      content: 'Mỗi dòng là một voucher để theo dõi nhanh.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${VOUCHER_TOUR_ID}:view"]`,
      title: 'Xem chi tiết voucher',
      content: 'Nhấn để mở thông tin chi tiết voucher.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${VOUCHER_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa voucher',
      content: 'Dùng nút này để cập nhật nội dung voucher.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${VOUCHER_TOUR_ID}:delete"]`,
      title: 'Xóa voucher',
      content: 'Dùng nút này để xóa voucher không còn sử dụng.',
      placement: 'left',
    },
  ];
};
