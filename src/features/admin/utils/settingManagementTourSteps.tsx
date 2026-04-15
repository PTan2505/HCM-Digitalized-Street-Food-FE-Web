import type { Step } from 'react-joyride';

interface SettingManagementTourConfig {
  hasRows: boolean;
}

export const getSettingManagementTourSteps = ({
  hasRows,
}: SettingManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-setting-page-header"]',
      title: 'Tổng quan cấu hình hệ thống',
      content: 'Quản lý các tham số runtime quan trọng của hệ thống tại đây.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-setting-reload-button"]',
      title: 'Tải lại cấu hình',
      content: 'Nhấn để đồng bộ lại giá trị setting từ backend.',
      placement: 'left',
    },
    {
      target: '[data-tour="admin-setting-table-wrapper"]',
      title: 'Bảng setting',
      content:
        'Mỗi dòng tương ứng một setting và cho phép chỉnh sửa trực tiếp.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-setting-table-wrapper"]',
        title: 'Chưa có setting',
        content: 'Hiện chưa có cấu hình nào để hiển thị.',
        placement: 'top',
      },
    ];
  }

  return baseSteps;
};
