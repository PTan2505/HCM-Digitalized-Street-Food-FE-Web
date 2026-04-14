import React from 'react';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import { getRevenueOverviewTourSteps } from '@features/admin/utils/revenueOverviewTourSteps';

export default function RevenuePage(): React.JSX.Element {
  const [isTourRunning, setIsTourRunning] = React.useState(false);
  const [tourInstanceKey, setTourInstanceKey] = React.useState(0);

  const startTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  return (
    <div>
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={getRevenueOverviewTourSteps()}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      <div
        className="mb-6 flex items-start gap-2"
        data-tour="admin-revenue-page-header"
      >
        <h1 className="text-2xl font-bold">Dashboard - Tổng quan doanh thu</h1>
        <button
          type="button"
          onClick={startTour}
          aria-label="Mở hướng dẫn tổng quan doanh thu"
          title="Hướng dẫn"
          className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
        >
          <HelpOutlineIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        data-tour="admin-revenue-card-grid"
      >
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Tổng doanh thu</h3>
          <p className="mt-2 text-3xl font-bold">125.5M</p>
          <span className="text-sm text-green-600">+12.5%</span>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Đơn hàng</h3>
          <p className="mt-2 text-3xl font-bold">1,234</p>
          <span className="text-sm text-green-600">+8.2%</span>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Khách hàng</h3>
          <p className="mt-2 text-3xl font-bold">5,678</p>
          <span className="text-sm text-green-600">+15.3%</span>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Tăng trưởng</h3>
          <p className="mt-2 text-3xl font-bold">23.5%</p>
          <span className="text-sm text-green-600">+5.1%</span>
        </div>
      </div>
    </div>
  );
}
