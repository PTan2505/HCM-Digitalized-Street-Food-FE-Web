import type { Step } from 'react-joyride';

interface TasteManagementTourConfig {
  hasRows: boolean;
}

const TASTE_TOUR_ID = 'admin-taste';

export const getTasteManagementTourSteps = ({
  hasRows,
}: TasteManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="taste-page-header"]',
      title: 'Tổng quan quản lý khẩu vị',
      content: 'Đây là nơi quản lý các loại khẩu vị trong hệ thống.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="taste-create-button"]',
      title: 'Thêm khẩu vị',
      content: 'Nhấn để thêm một khẩu vị mới cho món ăn.',
      placement: 'left',
    },
    {
      target: '[data-tour="taste-table-wrapper"]',
      title: 'Danh sách khẩu vị',
      content: 'Bảng hiển thị tên và mô tả của từng khẩu vị.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="taste-table-wrapper"]',
        title: 'Chưa có khẩu vị',
        content: 'Hiện chưa có khẩu vị nào. Hãy thêm khẩu vị đầu tiên.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${TASTE_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng khẩu vị',
      content: 'Mỗi dòng là một khẩu vị để bạn theo dõi nhanh.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${TASTE_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa khẩu vị',
      content: 'Dùng nút này để cập nhật khẩu vị đã tạo.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${TASTE_TOUR_ID}:close"], [data-tour-action="${TASTE_TOUR_ID}:activate"]`,
      title: 'Đóng hoặc kích hoạt khẩu vị',
      content: 'Dùng nút này để cập nhật trạng thái hoạt động của khẩu vị.',
      placement: 'left',
    },
  ];
};
