import type { Step } from 'react-joyride';

interface BranchManagementTourConfig {
  hasBranchRows: boolean;
}

const BRANCH_TABLE_TOUR_ID = 'vendor-branch';

export const getBranchManagementTourSteps = ({
  hasBranchRows,
}: BranchManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="branch-page-header"]',
      title: 'Tổng quan quản lý chi nhánh',
      content:
        'Đây là khu vực chính để bạn quản lý toàn bộ chi nhánh. Mình sẽ đi từ tổng quan đến từng thao tác cụ thể.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="vendor-store-name"]',
      title: 'Tên cửa hàng',
      content:
        'Bạn có thể đổi nhanh tên cửa hàng tại đây bằng biểu tượng chỉnh sửa cạnh tên hiện tại.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="branch-create-button"]',
      title: 'Tạo mới hoặc thêm chi nhánh',
      content:
        'Nút này dùng để tạo cửa hàng mới (khi chưa có) hoặc thêm chi nhánh mới vào cửa hàng hiện tại.',
      placement: 'left',
    },
    {
      target: '[data-tour="branch-table-wrapper"]',
      title: 'Bảng danh sách chi nhánh',
      content:
        'Bảng hiển thị các chi nhánh đã xác thực cùng trạng thái đăng ký gói và thông tin quản lý.',
      placement: 'top',
    },
  ];

  if (!hasBranchRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="branch-table-wrapper"]',
        title: 'Chưa có dữ liệu chi nhánh',
        content:
          'Hiện chưa có chi nhánh đã xác thực để thao tác chi tiết. Hãy tạo/đăng ký chi nhánh trước, sau đó mở lại hướng dẫn để xem các thao tác nâng cao.',
        placement: 'top',
      },
    ];
  }

  const overviewSteps: Step[] = [
    {
      target: `[data-tour-table="${BRANCH_TABLE_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Dòng dữ liệu chi nhánh',
      content:
        'Mỗi dòng đại diện cho một chi nhánh. Bạn có thể theo dõi nhanh trạng thái và thông tin chính ngay tại đây.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action-trigger="${BRANCH_TABLE_TOUR_ID}"]`,
      title: 'Menu thao tác chi nhánh',
      content:
        'Nhấn nút ba chấm để mở toàn bộ nhóm thao tác quản lý cho từng chi nhánh.',
      placement: 'left',
      spotlightPadding: 8,
    },
    {
      target: '[data-tour="branch-page-header"]',
      title: 'Hoàn tất hướng dẫn tổng quan',
      content:
        'Bạn đã nắm được các khu vực chính. Khi cần thao tác cụ thể, chỉ cần mở menu ba chấm tại từng dòng chi nhánh.',
      placement: 'bottom-start',
    },
  ];

  return [...baseSteps, ...overviewSteps];
};
