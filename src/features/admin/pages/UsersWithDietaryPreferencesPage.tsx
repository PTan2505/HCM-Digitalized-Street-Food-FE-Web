import { useEffect, useState, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Person as PersonIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import type { UsersWithDietaryPreferences } from '@features/admin/types/userDietaryPreference';
import useDietary from '@features/admin/hooks/useDietary';
import { getUsersWithDietaryTourSteps } from '@features/admin/utils/usersWithDietaryTourSteps';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectUsersWithDietaryPreferences,
  selectUserDietaryPreferenceStatus,
  selectUsersWithDietaryPagination,
} from '@slices/userPreferenceDietary';

export default function UsersWithDietaryPreferencesPage(): JSX.Element {
  const usersWithDietary = useAppSelector(selectUsersWithDietaryPreferences);
  const status = useAppSelector(selectUserDietaryPreferenceStatus);
  const pagination = useAppSelector(selectUsersWithDietaryPagination);
  const { onGetUsersWithDietaryPreferences } = useDietary();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetUsersWithDietaryPreferences({ pageNumber, pageSize });
  }, [onGetUsersWithDietaryPreferences, pageNumber, pageSize]);

  const handlePageChange = useCallback((page: number): void => {
    setPageNumber(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number): void => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const columns = [
    // {
    //   key: 'userId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'userName',
      label: 'Tên người dùng',
      render: (value: unknown): React.ReactNode => (
        <Box className="flex items-center gap-2">
          <PersonIcon fontSize="small" className="text-primary-600" />
          <Box className="text-table-text-primary font-semibold">
            {String(value)}
          </Box>
        </Box>
      ),
    },
    {
      key: 'dietaryPreferences',
      label: 'Chế độ ăn',
      render: (value: unknown): React.ReactNode => {
        const preferences = value as string[];
        const maxDisplay = 3;
        const displayPrefs = preferences.slice(0, maxDisplay);
        const remaining = preferences.length - maxDisplay;

        return (
          <Box className="flex items-center gap-1">
            {displayPrefs.map((pref, index) => (
              <Chip
                key={index}
                label={pref}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {remaining > 0 && (
              <Chip
                label={`+${remaining}`}
                size="small"
                color="default"
                variant="filled"
              />
            )}
          </Box>
        );
      },
    },
  ];

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

  const tourSteps = useMemo(() => {
    return getUsersWithDietaryTourSteps({
      hasRows: usersWithDietary.length > 0,
    });
  }, [usersWithDietary.length]);

  return (
    <div className="font-[var(--font-nunito)]">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
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

      {/* Header */}
      <div
        className="mb-6 flex items-center justify-between"
        data-tour="admin-user-dietary-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-3xl font-bold text-[var(--color-table-text-primary)]">
              Người dùng theo chế độ ăn
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn người dùng theo chế độ ăn"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách người dùng và chế độ ăn uống đặc biệt của họ
          </p>
        </div>
      </div>

      {/* Table */}
      <div data-tour="admin-user-dietary-table-wrapper">
        <Table<UsersWithDietaryPreferences>
          columns={columns}
          data={usersWithDietary}
          rowKey="userId"
          loading={status === 'pending'}
          emptyMessage="Chưa có người dùng nào có chế độ ăn"
        />
      </div>

      {/* Pagination */}
      <div data-tour="admin-user-dietary-pagination">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          hasPrevious={pagination.hasPrevious}
          hasNext={pagination.hasNext}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
