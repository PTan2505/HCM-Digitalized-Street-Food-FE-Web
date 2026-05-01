import type { Step } from 'react-joyride';

interface BranchManagementTourConfig {
  hasBranch: boolean;
}

export const getManagerBranchManagementTourSteps = ({
  hasBranch,
}: BranchManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="manager-branch-header"]',
      title: 'Tổng quan quản lý chi nhánh',
      content:
        'Đây là khu vực quản lý thông tin chi nhánh bạn đang phụ trách. Mình sẽ giới thiệu nhanh các vùng chính.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="manager-branch-summary"]',
      title: 'Thông tin cơ bản',
      content:
        'Bạn có thể cập nhật nhanh tên chi nhánh, số điện thoại và email ngay trong phần này.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-branch-address"]',
      title: 'Địa chỉ và bản đồ',
      content:
        'Phần địa chỉ giúp chỉnh sửa vị trí chi tiết của chi nhánh để hiển thị đúng cho khách hàng.',
      placement: 'top',
    },
    {
      target: '[data-tour="manager-branch-images"]',
      title: 'Hình ảnh chi nhánh',
      content:
        'Khu vực này dùng để theo dõi và cập nhật hình ảnh đại diện cho chi nhánh.',
      placement: 'top',
    },
    {
      target: '[data-tour="manager-branch-status"]',
      title: 'Trạng thái vận hành',
      content:
        'Bạn có thể theo dõi nhanh trạng thái xác thực, hoạt động và chỉ số đánh giá hiện tại.',
      placement: 'top',
    },
  ];

  if (hasBranch) {
    return baseSteps;
  }

  return [
    ...baseSteps,
    {
      target: '[data-tour="manager-branch-empty"]',
      title: 'Chưa có chi nhánh',
      content:
        'Hiện chưa có chi nhánh được gán cho tài khoản này. Khi có dữ liệu, bạn có thể mở lại hướng dẫn để xem đầy đủ.',
      placement: 'top',
    },
  ];
};
