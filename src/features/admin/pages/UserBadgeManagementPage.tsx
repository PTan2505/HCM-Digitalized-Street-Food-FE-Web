import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import { Avatar, Chip } from '@mui/material';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import UserBadgeFormModal from '@features/admin/components/UserBadgeFormModal';
import type { UserWithBadges, Badge } from '@features/admin/types/badge';
import useBadge from '@features/admin/hooks/useBadge';
import { getUserBadgeManagementTourSteps } from '@features/admin/utils/userBadgeManagementTourSteps';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectUsersWithBadges,
  selectBadges,
  selectBadgeStatus,
  selectUsersWithBadgesPagination,
} from '@slices/badge';

export default function UserBadgeManagement(): JSX.Element {
  const usersWithBadges = useAppSelector(selectUsersWithBadges);
  const allBadges = useAppSelector(selectBadges);
  const status = useAppSelector(selectBadgeStatus);
  const pagination = useAppSelector(selectUsersWithBadgesPagination);
  const {
    onGetUsersWithBadges,
    onGetAllBadges,
    onAwardBadgeToUser,
    onRevokeBadgeFromUser,
  } = useBadge();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithBadges | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetUsersWithBadges({ pageNumber, pageSize });
    void onGetAllBadges();
  }, [onGetUsersWithBadges, onGetAllBadges, pageNumber, pageSize]);

  const handlePageChange = useCallback((page: number): void => {
    setPageNumber(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number): void => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const availableBadges = allBadges.map((b) => ({
    badgeId: b.badgeId,
    badgeName: b.badgeName,
    iconUrl: b.iconUrl,
  }));

  const handleOpenDialog = (user: UserWithBadges): void => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleAssignBadge = async (
    userId: number,
    badgeId: number
  ): Promise<void> => {
    try {
      await onAwardBadgeToUser({ userId, badgeId });
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  };

  const handleRemoveBadge = async (
    userId: number,
    badgeId: number
  ): Promise<void> => {
    try {
      await onRevokeBadgeFromUser({ userId, badgeId });
    } catch (error) {
      console.error('Failed to revoke badge:', error);
    }
  };

  const columns = [
    // {
    //   key: 'userId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'userName',
      label: 'Tên người dùng',
      render: (
        value: unknown,
        row: Record<string, unknown>
      ): React.ReactNode => (
        <div>
          <div className="font-semibold text-[var(--color-table-text-primary)]">
            {String(value)}
          </div>
          <div className="text-xs text-[var(--color-table-text-secondary)]">
            {String(row.email)}
          </div>
        </div>
      ),
    },
    {
      key: 'badges',
      label: 'Huy hiệu',
      render: (value: unknown): React.ReactNode => {
        const badges = value as Badge[];
        return (
          <div className="flex flex-wrap gap-1">
            {badges.length === 0 ? (
              <span className="text-xs text-[var(--color-table-text-secondary)]">
                Chưa có huy hiệu nào
              </span>
            ) : (
              badges.map((badge) => (
                <div
                  key={badge.badgeId}
                  // className="flex items-center gap-1 rounded-full bg-[var(--color-primary-100)] px-2 py-1"
                >
                  <Avatar
                    src={badge.iconUrl}
                    alt={badge.badgeName}
                    className="h-4 w-4"
                  />
                  {/* <span className="text-xs font-medium text-[var(--color-primary-800)]">
                    {badge.badgeName}
                  </span> */}
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      key: 'point',
      label: 'Tổng điểm',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={`${String(value)} điểm`}
          size="small"
          className="bg-[var(--color-admin-active-bg)] font-[var(--font-nunito)] font-semibold text-[var(--color-admin-active-text)]"
        />
      ),
    },
  ];

  const actions = [
    {
      id: 'manage-badge',
      label: (
        <div className="flex items-center gap-1">
          {/* <AddIcon fontSize="small" /> */}
          <span>Thêm hoặc thu hồi huy hiệu</span>
        </div>
      ),
      onClick: (row: Record<string, unknown>): void =>
        handleOpenDialog(row as unknown as UserWithBadges),
      tooltip: 'Thêm hoặc thu hồi huy hiệu',
      color: 'primary' as const,
      variant: 'outlined' as const,
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
    return getUserBadgeManagementTourSteps({
      hasRows: usersWithBadges.length > 0,
    });
  }, [usersWithBadges.length]);

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
        data-tour="admin-user-badge-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-3xl font-bold text-[var(--color-table-text-primary)]">
              Quản lý huy hiệu của người dùng
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn quản lý huy hiệu người dùng"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Gán và quản lý badges cho từng người dùng
          </p>
        </div>
      </div>

      {/* Table */}
      <div data-tour="admin-user-badge-table-wrapper">
        <Table
          columns={columns}
          data={usersWithBadges as unknown as Record<string, unknown>[]}
          rowKey="userId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có người dùng nào"
          tourId="admin-user-badge"
        />
      </div>

      {/* Pagination */}
      <div data-tour="admin-user-badge-pagination">
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

      {/* Modal Form */}
      <UserBadgeFormModal
        isOpen={openDialog}
        user={selectedUser}
        availableBadges={availableBadges}
        onClose={handleCloseDialog}
        onAssignBadge={handleAssignBadge}
        onRemoveBadge={handleRemoveBadge}
      />
    </div>
  );
}
