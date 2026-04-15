import type { Step } from 'react-joyride';

interface WorkScheduleManagementTourConfig {
  hasRows: boolean;
}

export const getManagerWorkScheduleManagementTourSteps = ({
  hasRows,
}: WorkScheduleManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="manager-work-schedule-header"]',
      title: 'Tổng quan lịch hoạt động',
      content:
        'Trang này giúp bạn cập nhật giờ mở cửa và đóng cửa theo từng ngày trong tuần.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="manager-work-schedule-summary"]',
      title: 'Thông tin chi nhánh',
      content:
        'Khu vực này hiển thị chi nhánh hiện tại và số ngày đã có lịch hoạt động.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-work-schedule-list"]',
      title: 'Danh sách lịch theo ngày',
      content:
        'Mỗi dòng tương ứng một ngày trong tuần, bạn có thể sửa hoặc xóa trực tiếp.',
      placement: 'top',
    },
  ];

  if (hasRows) {
    return baseSteps;
  }

  return [
    ...baseSteps,
    {
      target: '[data-tour="manager-work-schedule-list"]',
      title: 'Chưa có lịch hoạt động',
      content:
        'Hiện chưa có lịch hoạt động cho chi nhánh. Khi dữ liệu có sẵn, bạn có thể chạy lại hướng dẫn.',
      placement: 'top',
    },
  ];
};
