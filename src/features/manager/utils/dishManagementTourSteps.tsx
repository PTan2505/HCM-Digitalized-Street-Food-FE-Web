import type { Step } from 'react-joyride';

interface DishManagementTourConfig {
  hasRows: boolean;
}

const MANAGER_DISH_TOUR_ID = 'manager-dish';

export const getManagerDishManagementTourSteps = ({
  hasRows,
}: DishManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="manager-dish-header"]',
      title: 'Tổng quan quản lý thực đơn',
      content:
        'Trang này giúp bạn gán món ăn vào chi nhánh và kiểm soát trạng thái còn món hoặc hết món.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="manager-dish-summary"]',
      title: 'Thông tin tổng quan',
      content:
        'Khu vực tổng hợp số lượng món đang hiển thị, số món đã gán và số món bạn đang chọn.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-dish-filter"]',
      title: 'Bộ lọc món ăn',
      content:
        'Dùng bộ lọc để tìm nhanh món theo tên hoặc danh mục trước khi thao tác.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-dish-save-button"]',
      title: 'Lưu thay đổi',
      content:
        'Sau khi chọn hoặc bỏ chọn món, nhấn nút này để cập nhật danh sách món của chi nhánh.',
      placement: 'top',
    },
    {
      target: '[data-tour="manager-dish-table-wrapper"]',
      title: 'Bảng danh sách món',
      content:
        'Bảng cho phép chọn món và bật/tắt trạng thái bán cho từng món đã gán.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return baseSteps;
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${MANAGER_DISH_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Dòng món ăn',
      content:
        'Mỗi dòng là một món ăn với thông tin trạng thái gán và công tắc còn/hết món.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: '[data-tour="manager-dish-pagination"]',
      title: 'Phân trang danh sách món',
      content: 'Bạn có thể chuyển trang để quản lý đầy đủ toàn bộ thực đơn.',
      placement: 'top',
    },
  ];
};
