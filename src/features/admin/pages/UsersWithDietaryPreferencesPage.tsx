import { useEffect } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import type { UsersWithDietaryPreferences } from '@features/admin/types/userDietaryPreference';
import useDietary from '@features/admin/hooks/useDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectUsersWithDietaryPreferences,
  selectUserDietaryPreferenceStatus,
} from '@slices/userPreferenceDietary';

export default function UsersWithDietaryPreferencesPage(): JSX.Element {
  const usersWithDietary = useAppSelector(selectUsersWithDietaryPreferences);
  const status = useAppSelector(selectUserDietaryPreferenceStatus);
  const { onGetUsersWithDietaryPreferences } = useDietary();

  useEffect(() => {
    void onGetUsersWithDietaryPreferences();
  }, [onGetUsersWithDietaryPreferences]);

  const columns = [
    {
      key: 'userId',
      label: 'ID',
      style: { width: '80px' },
    },
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
        return (
          <Box className="flex flex-wrap gap-1">
            {preferences.map((pref, index) => (
              <Chip
                key={index}
                label={pref}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
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
    </div>
  );
}
