import type { Step } from 'react-joyride';

export const getTransactionsTourSteps = (): Step[] => {
  return [
    {
      target: '[data-tour="admin-transactions-page-header"]',
      title: 'Tổng quan giao dịch',
      content: 'Trang này sẽ hiển thị danh sách giao dịch của hệ thống.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-transactions-content"]',
      title: 'Khu vực dữ liệu giao dịch',
      content:
        'Đây là vùng hiển thị dữ liệu giao dịch khi module được hoàn thiện.',
      placement: 'top',
    },
  ];
};
