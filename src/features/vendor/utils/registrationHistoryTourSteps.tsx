import type { Step } from 'react-joyride';

interface RegistrationHistoryTourConfig {
  hasRows: boolean;
}

const REGISTRATION_HISTORY_TOUR_ID = 'vendor-registration-history';

export const getRegistrationHistoryTourSteps = ({
  hasRows,
}: RegistrationHistoryTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="registration-history-header"]',
      title: 'Tổng quan lịch sử đăng ký',
      content: 'Trang này hiển thị toàn bộ chi nhánh đã đăng ký của vendor.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="registration-history-table-wrapper"]',
      title: 'Danh sách lịch sử',
      content: 'Bảng thể hiện trạng thái kiểm duyệt, xác thực và hoạt động.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="registration-history-table-wrapper"]',
        title: 'Chưa có lịch sử đăng ký',
        content: 'Hiện chưa có chi nhánh nào được ghi nhận trong lịch sử.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${REGISTRATION_HISTORY_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng chi nhánh',
      content: 'Mỗi dòng tương ứng một hồ sơ đăng ký chi nhánh.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action-trigger="${REGISTRATION_HISTORY_TOUR_ID}"]`,
      title: 'Menu thao tác',
      content: 'Mở menu để xem chi tiết hoặc chỉnh sửa khi được phép.',
      placement: 'left',
      spotlightPadding: 8,
    },
  ];
};
