import React from 'react';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import { getTransactionsTourSteps } from '@features/admin/utils/transactionsTourSteps';

export default function TransactionsPage(): React.JSX.Element {
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
        steps={getTransactionsTourSteps()}
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
        data-tour="admin-transactions-page-header"
      >
        <h1 className="text-2xl font-bold">Quản lý giao dịch</h1>
        <button
          type="button"
          onClick={startTour}
          aria-label="Mở hướng dẫn trang giao dịch"
          title="Hướng dẫn"
          className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
        >
          <HelpOutlineIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      <div
        className="rounded-lg bg-white p-6 shadow"
        data-tour="admin-transactions-content"
      >
        <p className="text-gray-600">Danh sách giao dịch sẽ hiển thị tại đây</p>
      </div>
    </div>
  );
}
