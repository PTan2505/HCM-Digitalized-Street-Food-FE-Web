import { useEffect, useState, useCallback } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import type { UsersWithDietaryPreferences } from '@features/admin/types/userDietaryPreference';
import useDietary from '@features/admin/hooks/useDietary';
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

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Người dùng theo chế độ ăn
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách người dùng và chế độ ăn uống đặc biệt của họ
          </p>
        </div>
      </div>

      {/* Table */}
      <Table<UsersWithDietaryPreferences>
        columns={columns}
        data={usersWithDietary}
        rowKey="userId"
        loading={status === 'pending'}
        emptyMessage="Chưa có người dùng nào có chế độ ăn"
      />

      {/* Pagination */}
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
  );
}
