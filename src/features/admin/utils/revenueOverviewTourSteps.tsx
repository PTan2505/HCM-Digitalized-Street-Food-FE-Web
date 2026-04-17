import type { Step } from 'react-joyride';

export const getRevenueOverviewTourSteps = (): Step[] => {
  return [
    {
      target: '[data-tour="admin-revenue-page-header"]',
      title: 'Tổng quan doanh thu',
      content: 'Trang này cung cấp các chỉ số doanh thu và tăng trưởng chính.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-revenue-card-grid"]',
      title: 'Các chỉ số nhanh',
      content:
        'Theo dõi doanh thu, đơn hàng, khách hàng và tốc độ tăng trưởng trong một màn hình.',
      placement: 'top',
    },
  ];
};
