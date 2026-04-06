import type { Step } from 'react-joyride';

interface DishManagementTourConfig {
  hasRows: boolean;
}

const DISH_TOUR_ID = 'vendor-dish';

export const getDishManagementTourSteps = ({
  hasRows,
}: DishManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="dish-page-header"]',
      title: 'Tổng quan quản lý món ăn',
      content: 'Đây là khu vực quản lý danh sách món ăn của cửa hàng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="dish-create-button"]',
      title: 'Thêm món ăn mới',
      content: 'Dùng nút này để mở form tạo món ăn mới.',
      placement: 'left',
    },
    {
      target: '[data-tour="dish-filter-section"]',
      title: 'Bộ lọc món ăn',
      content: 'Bạn có thể lọc theo từ khóa hoặc danh mục để tìm nhanh món.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="dish-table-wrapper"]',
      title: 'Bảng danh sách món ăn',
      content: 'Bảng hiển thị ảnh, giá, danh mục và trạng thái bán của món ăn.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="dish-table-wrapper"]',
        title: 'Chưa có món ăn',
        content: 'Hiện chưa có món ăn nào. Hãy thêm món đầu tiên để bắt đầu.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${DISH_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng món ăn',
      content: 'Mỗi dòng là một món ăn với thông tin đầy đủ để theo dõi.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action-trigger="${DISH_TOUR_ID}"]`,
      title: 'Menu thao tác',
      content: 'Nhấn nút ba chấm để chỉnh sửa hoặc xóa món ăn.',
      placement: 'left',
      spotlightPadding: 8,
    },
    {
      target: '[data-tour="dish-pagination"]',
      title: 'Phân trang',
      content: 'Điều chỉnh trang hiện tại và số bản ghi mỗi trang tại đây.',
      placement: 'top',
    },
  ];
};
