import type { Step } from 'react-joyride';

interface DayOffManagementTourConfig {
  hasRows: boolean;
  isAddFormVisible: boolean;
}

export const getManagerDayOffManagementTourSteps = ({
  hasRows,
  isAddFormVisible,
}: DayOffManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="manager-dayoff-header"]',
      title: 'Tổng quan quản lý thời gian nghỉ',
      content:
        'Trang này giúp bạn quản lý các đợt nghỉ của chi nhánh để tránh nhận đơn ngoài thời gian phục vụ.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="manager-dayoff-summary"]',
      title: 'Thông tin tổng quan',
      content: 'Khu vực này hiển thị chi nhánh và tổng số đợt nghỉ hiện có.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-dayoff-create-button"]',
      title: 'Thêm thời gian nghỉ',
      content:
        'Nhấn nút này để tạo một đợt nghỉ mới theo ngày hoặc theo khung giờ cụ thể.',
      placement: 'left',
    },
  ];

  if (isAddFormVisible) {
    baseSteps.push({
      target: '[data-tour="manager-dayoff-form"]',
      title: 'Biểu mẫu thêm đợt nghỉ',
      content:
        'Tại đây bạn chọn ngày bắt đầu, ngày kết thúc và khung giờ nghỉ nếu cần.',
      placement: 'top',
    });
  }

  baseSteps.push({
    target: '[data-tour="manager-dayoff-list"]',
    title: 'Danh sách đợt nghỉ',
    content:
      'Danh sách cho phép theo dõi từng đợt nghỉ và xóa khi không còn áp dụng.',
    placement: 'top',
  });

  if (hasRows) {
    return baseSteps;
  }

  return [
    ...baseSteps,
    {
      target: '[data-tour="manager-dayoff-list"]',
      title: 'Chưa có đợt nghỉ',
      content:
        'Hiện chưa có dữ liệu thời gian nghỉ. Bạn có thể thêm đợt nghỉ đầu tiên từ nút tạo mới.',
      placement: 'top',
    },
  ];
};
