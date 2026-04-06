import type { Step } from 'react-joyride';

interface DietaryPreferencesTourConfig {
  hasRows: boolean;
}

const DIETARY_TOUR_ID = 'vendor-dietary';

export const getDietaryPreferencesTourSteps = ({
  hasRows,
}: DietaryPreferencesTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="dietary-page-header"]',
      title: 'Tổng quan chế độ ăn',
      content:
        'Trang này giúp bạn khai báo các chế độ ăn mà quán đang phục vụ.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="dietary-save-button"]',
      title: 'Lưu thay đổi',
      content: 'Sau khi chọn hoặc bỏ chọn, nhấn nút này để cập nhật.',
      placement: 'left',
    },
    {
      target: '[data-tour="dietary-summary"]',
      title: 'Tóm tắt lựa chọn',
      content: 'Hiển thị tổng số chế độ ăn và số lượng đang áp dụng.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="dietary-table-wrapper"]',
      title: 'Danh sách chế độ ăn',
      content: 'Chọn checkbox để bật/tắt chế độ ăn áp dụng cho cửa hàng.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="dietary-table-wrapper"]',
        title: 'Chưa có dữ liệu',
        content: 'Hệ thống chưa trả về chế độ ăn nào để chọn.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${DIETARY_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chế độ ăn',
      content: 'Mỗi dòng gồm checkbox, tên, mô tả và trạng thái áp dụng.',
      placement: 'top',
      spotlightPadding: 6,
    },
  ];
};
