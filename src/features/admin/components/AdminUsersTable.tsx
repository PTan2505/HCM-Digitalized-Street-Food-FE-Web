import Table from '@features/admin/components/Table';
import UserStatusBadge from '@features/admin/components/UserStatusBadge';
import type {
  AdminUserItem,
  UserRoleFilter,
} from '@features/admin/types/userManagement';
import type { JSX } from 'react';

interface AdminUsersTableProps {
  users: AdminUserItem[];
  loading: boolean;
  roleFilter: UserRoleFilter;
  processingUserId: number | null;
  onToggleBan: (user: AdminUserItem) => void;
  onPromoteModerator: (user: AdminUserItem) => void;
  tourId?: string;
}

const mapRoleLabel = (role: string | number | null | undefined): string => {
  if (typeof role === 'number') {
    const roleMap: Record<number, string> = {
      0: 'User',
      1: 'Vendor',
      2: 'Moderator',
      3: 'Admin',
    };
    return roleMap[role] ?? String(role);
  }

  if (typeof role === 'string') {
    return role;
  }

  return '-';
};

const getDisplayName = (user: AdminUserItem): string => {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return fullName || '-';
};

const getDisplayText = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '-';
};

const isUserBanned = (user: AdminUserItem): boolean => {
  if (typeof user.isBanned === 'boolean') {
    return user.isBanned;
  }

  if (typeof user.banned === 'boolean') {
    return user.banned;
  }

  if (typeof user.isBlocked === 'boolean') {
    return user.isBlocked;
  }

  return user.status?.toLowerCase() === 'banned';
};

export default function AdminUsersTable({
  users,
  loading,
  roleFilter,
  processingUserId,
  onToggleBan,
  onPromoteModerator,
  tourId,
}: AdminUsersTableProps): JSX.Element {
  return (
    <Table
      columns={[
        {
          key: 'userName',
          label: 'Tên đăng nhập',
        },
        {
          key: 'fullName',
          label: 'Họ và tên',
          render: (_value, row) => getDisplayName(row),
        },
        {
          key: 'email',
          label: 'Email',
          render: (value) => getDisplayText(value),
        },
        {
          key: 'phoneNumber',
          label: 'Số điện thoại',
          render: (value) => getDisplayText(value),
        },
        {
          key: 'role',
          label: 'Vai trò',
          render: (value) => mapRoleLabel(value as string | number | null),
        },
        {
          key: 'status',
          label: 'Trạng thái',
          render: (_value, row): JSX.Element => {
            return <UserStatusBadge isBanned={isUserBanned(row)} />;
          },
        },
      ]}
      data={users}
      loading={loading}
      emptyMessage="Không có người dùng"
      rowKey="id"
      tourId={tourId}
      actions={
        roleFilter === 'user'
          ? [
              {
                id: 'toggle-ban',
                label: (row: AdminUserItem): string =>
                  isUserBanned(row) ? 'Bỏ chặn' : 'Chặn',
                onClick: (row): void => {
                  if (processingUserId !== null) {
                    return;
                  }

                  onToggleBan(row);
                },
                variant: 'outlined',
                color: 'warning',
                tooltip:
                  processingUserId !== null
                    ? 'Đang cập nhật trạng thái...'
                    : 'Khóa hoặc mở khóa tài khoản',
              },
              {
                id: 'promote-moderator',
                label: 'Thêm Moderator',
                onClick: (row): void => {
                  if (processingUserId !== null) {
                    return;
                  }

                  onPromoteModerator(row);
                },
                variant: 'outlined',
                color: 'info',
                tooltip:
                  processingUserId !== null
                    ? 'Đang cập nhật vai trò...'
                    : 'Nâng quyền thành moderator',
              },
            ]
          : undefined
      }
    />
  );
}
