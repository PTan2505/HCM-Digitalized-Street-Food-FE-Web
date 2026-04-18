import type { Step } from 'react-joyride';

interface VendorVerificationTourConfig {
  hasRows: boolean;
}

export const getVendorVerificationTourSteps = ({
  hasRows,
}: VendorVerificationTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-vendor-verification-page-header"]',
      title: 'Tổng quan xác minh người bán',
      content:
        'Trang này giúp kiểm duyệt các yêu cầu đăng ký chi nhánh từ cửa hàng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-vendor-verification-filter"]',
      title: 'Bộ lọc loại yêu cầu',
      content:
        'Chọn nhóm yêu cầu chờ xử lý để tập trung kiểm duyệt đúng luồng.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="admin-vendor-verification-table"]',
      title: 'Danh sách yêu cầu',
      content:
        'Bảng hiển thị thông tin cửa hàng, chi nhánh và các thao tác duyệt hoặc từ chối.',
      placement: 'top',
    },
    {
      target: '[data-tour="admin-vendor-verification-pagination"]',
      title: 'Phân trang',
      content: 'Di chuyển qua các trang để xử lý toàn bộ yêu cầu.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-vendor-verification-table"]',
        title: 'Chưa có yêu cầu cần xử lý',
        content:
          'Hiện chưa có đăng ký chi nhánh nào trong trạng thái chờ duyệt.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target:
        '[data-tour="admin-vendor-verification-table"] tbody tr:first-child',
      title: 'Một yêu cầu xác minh',
      content: 'Mỗi dòng là một yêu cầu đăng ký chi nhánh cần Admin xử lý.',
      placement: 'top',
      spotlightPadding: 6,
    },
  ];
};
