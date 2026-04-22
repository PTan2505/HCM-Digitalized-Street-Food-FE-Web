import type { Step } from 'react-joyride';

interface DietaryManagementTourConfig {
  hasRows: boolean;
}

const DIETARY_TOUR_ID = 'admin-dietary';

export const getDietaryManagementTourSteps = ({
  hasRows,
}: DietaryManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="dietary-page-header"]',
      title: 'Tổng quan quản lý chế độ ăn',
      content: 'Đây là nơi quản lý các chế độ ăn hỗ trợ người dùng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="dietary-create-button"]',
      title: 'Thêm chế độ ăn',
      content: 'Nhấn để tạo chế độ ăn mới.',
      placement: 'left',
    },
    {
      target: '[data-tour="dietary-table-wrapper"]',
      title: 'Danh sách chế độ ăn',
      content: 'Bảng hiển thị tên và mô tả chế độ ăn hiện có.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="dietary-table-wrapper"]',
        title: 'Chưa có chế độ ăn',
        content: 'Hiện chưa có chế độ ăn nào trong hệ thống.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${DIETARY_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chế độ ăn',
      content: 'Mỗi dòng là một chế độ ăn để quản trị nhanh.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${DIETARY_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa chế độ ăn',
      content: 'Dùng nút này để cập nhật nội dung chế độ ăn.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${DIETARY_TOUR_ID}:close"], [data-tour-action="${DIETARY_TOUR_ID}:activate"]`,
      title: 'Đóng hoặc kích hoạt chế độ ăn',
      content: 'Dùng nút này để cập nhật trạng thái hoạt động của chế độ ăn.',
      placement: 'left',
    },
  ];
};
