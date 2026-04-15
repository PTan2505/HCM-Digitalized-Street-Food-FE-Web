import type { Step } from 'react-joyride';

interface CategoryManagementTourConfig {
  hasRows: boolean;
}

const CATEGORY_TOUR_ID = 'admin-category';

export const getCategoryManagementTourSteps = ({
  hasRows,
}: CategoryManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="category-page-header"]',
      title: 'Tổng quan quản lý danh mục',
      content: 'Đây là khu vực quản lý danh mục sản phẩm trong hệ thống.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="category-create-button"]',
      title: 'Thêm danh mục',
      content: 'Nhấn để tạo danh mục mới cho hệ thống.',
      placement: 'left',
    },
    {
      target: '[data-tour="category-table-wrapper"]',
      title: 'Bảng danh sách danh mục',
      content: 'Theo dõi tên, mô tả và hình ảnh của từng danh mục tại đây.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="category-table-wrapper"]',
        title: 'Chưa có danh mục',
        content: 'Hiện chưa có danh mục nào. Hãy thêm danh mục đầu tiên.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${CATEGORY_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng danh mục',
      content: 'Mỗi dòng thể hiện thông tin tổng quan của một danh mục.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${CATEGORY_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa danh mục',
      content: 'Dùng nút này để cập nhật thông tin danh mục.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${CATEGORY_TOUR_ID}:delete"]`,
      title: 'Xóa danh mục',
      content: 'Dùng nút này để xóa danh mục khỏi hệ thống.',
      placement: 'left',
    },
  ];
};
