import Pagination from '@features/admin/components/Pagination';
import AdminUsersTable from '@features/admin/components/AdminUsersTable';
import UserSearchableSelect from '@features/admin/components/UserSearchableSelect';
import type {
  AdminUserItem,
  GetUsersResponse,
  UserRoleFilter,
} from '@features/admin/types/userManagement';
import { axiosApi } from '@lib/api/apiInstance';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { FilterAltOff as FilterAltOffIcon } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useLocation } from 'react-router-dom';

type ConfirmActionType = 'toggleBan' | 'promoteModerator' | null;

interface AdminPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const DEFAULT_PAGINATION: AdminPagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalCount: 0,
  hasPrevious: false,
  hasNext: false,
};

const normalizeRoleFilter = (pathname: string): UserRoleFilter => {
  if (pathname.endsWith('/users/vendor')) {
    return 'vendor';
  }

  if (pathname.endsWith('/users/system')) {
    return 'system';
  }

  return 'user';
};

const resolveUserRole = (
  role: string | number | null | undefined
): 'user' | 'vendor' | 'admin' | 'moderator' | 'unknown' => {
  if (typeof role === 'number') {
    const numericRoleMap: Record<
      number,
      'user' | 'vendor' | 'moderator' | 'admin'
    > = {
      0: 'user',
      1: 'vendor',
      2: 'moderator',
      3: 'admin',
    };

    return numericRoleMap[role] ?? 'unknown';
  }

  if (typeof role === 'string') {
    const normalizedRole = role.trim().toLowerCase();

    if (normalizedRole.includes('admin')) {
      return 'admin';
    }

    if (normalizedRole.includes('moderator')) {
      return 'moderator';
    }

    if (
      normalizedRole.includes('vendor') ||
      normalizedRole.includes('partner')
    ) {
      return 'vendor';
    }

    if (
      normalizedRole.includes('user') ||
      normalizedRole.includes('customer')
    ) {
      return 'user';
    }
  }

  return 'unknown';
};

const matchesRoleFilter = (
  user: AdminUserItem,
  roleFilter: UserRoleFilter
): boolean => {
  const resolvedRole = resolveUserRole(user.role);

  if (roleFilter === 'system') {
    return resolvedRole === 'admin' || resolvedRole === 'moderator';
  }

  return resolvedRole === roleFilter;
};

const isUserBanned = (user: AdminUserItem): boolean => {
  return Boolean(
    user.isBanned ??
    user.banned ??
    user.isBlocked ??
    user.status?.toLowerCase() === 'banned'
  );
};

const convertToPagination = (response: GetUsersResponse): AdminPagination => {
  return {
    currentPage: response.currentPage,
    pageSize: response.pageSize,
    totalPages: response.totalPages,
    totalCount: response.totalCount,
    hasPrevious: response.hasPrevious,
    hasNext: response.hasNext,
  };
};

export default function UsersPage(): JSX.Element {
  const location = useLocation();
  const roleFilter = useMemo<UserRoleFilter>(
    () => normalizeRoleFilter(location.pathname),
    [location.pathname]
  );

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] =
    useState<AdminPagination>(DEFAULT_PAGINATION);
  const [processingUserId, setProcessingUserId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [confirmActionType, setConfirmActionType] =
    useState<ConfirmActionType>(null);
  const [selectedActionUser, setSelectedActionUser] =
    useState<AdminUserItem | null>(null);

  const pageTitle =
    roleFilter === 'vendor'
      ? 'Quản lý đối tác'
      : roleFilter === 'system'
        ? 'Quản lý hệ thống (Admin/Moderator)'
        : 'Quản lý khách hàng';

  const roleFilterLabel =
    roleFilter === 'vendor'
      ? 'đối tác'
      : roleFilter === 'system'
        ? 'admin/moderator'
        : 'khách hàng';

  const loadUsers = useCallback(async (): Promise<void> => {
    setLoading(true);

    try {
      const keyword = debouncedSearchKeyword.trim();

      if (keyword.length > 0) {
        const response = await axiosApi.userAdminApi.searchUsers({
          query: keyword,
          pageNumber: page,
          pageSize,
        });

        setUsers(
          response.items.filter((user) => matchesRoleFilter(user, roleFilter))
        );
        setPagination(convertToPagination(response));
        return;
      }

      if (roleFilter === 'system') {
        const [adminResponse, moderatorResponse] = await Promise.all([
          axiosApi.userAdminApi.getUsers({
            role: 'admin',
            pageNumber: page,
            pageSize,
          }),
          axiosApi.userAdminApi.getUsers({
            role: 'moderator',
            pageNumber: page,
            pageSize,
          }),
        ]);

        const mergedUsers = [...adminResponse.items, ...moderatorResponse.items]
          .filter((item, index, array) => {
            return (
              array.findIndex((candidate) => candidate.id === item.id) === index
            );
          })
          .sort((a, b) => b.id - a.id);

        setUsers(mergedUsers);
        setPagination({
          currentPage: page,
          pageSize,
          totalPages: Math.max(
            adminResponse.totalPages,
            moderatorResponse.totalPages
          ),
          totalCount: adminResponse.totalCount + moderatorResponse.totalCount,
          hasPrevious:
            adminResponse.hasPrevious || moderatorResponse.hasPrevious,
          hasNext: adminResponse.hasNext || moderatorResponse.hasNext,
        });
        return;
      }

      const response = await axiosApi.userAdminApi.getUsers({
        role: roleFilter,
        pageNumber: page,
        pageSize,
      });

      setUsers(response.items);
      setPagination(convertToPagination(response));
    } catch {
      // toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, page, pageSize, debouncedSearchKeyword]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 300);

    return (): void => {
      clearTimeout(timeout);
    };
  }, [searchKeyword]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
    setPageSize(10);
    setSearchKeyword('');
  }, [roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchKeyword]);

  const handleOpenConfirmToggleBan = useCallback(
    (user: AdminUserItem): void => {
      setSelectedActionUser(user);
      setConfirmActionType('toggleBan');
    },
    []
  );

  const handleOpenConfirmPromoteModerator = useCallback(
    (user: AdminUserItem): void => {
      setSelectedActionUser(user);
      setConfirmActionType('promoteModerator');
    },
    []
  );

  const handleCloseConfirmDialog = useCallback((): void => {
    if (processingUserId !== null) {
      return;
    }

    setConfirmActionType(null);
    setSelectedActionUser(null);
  }, [processingUserId]);

  const handleToggleBan = useCallback(
    async (user: AdminUserItem): Promise<void> => {
      const banned = isUserBanned(user);
      setProcessingUserId(user.id);

      try {
        if (banned) {
          await axiosApi.userAdminApi.unbanUser(user.id);
        } else {
          await axiosApi.userAdminApi.banUser(user.id);
        }

        const nextBannedState = !banned;
        setUsers((previousUsers) => {
          return previousUsers.map((item) => {
            if (item.id !== user.id) {
              return item;
            }

            return {
              ...item,
              isBanned: nextBannedState,
              banned: nextBannedState,
              isBlocked: nextBannedState,
              status: nextBannedState ? 'banned' : 'active',
            };
          });
        });
      } catch {
        // toast.error('Không thể cập nhật trạng thái chặn');
      } finally {
        setProcessingUserId(null);
      }
    },
    []
  );

  const handlePromoteModerator = useCallback(
    async (user: AdminUserItem): Promise<void> => {
      setProcessingUserId(user.id);

      try {
        await axiosApi.userAdminApi.promoteModerator(user.id);
        setUsers((previousUsers) => {
          return previousUsers.filter((item) => item.id !== user.id);
        });
        setPagination((previousPagination) => {
          return {
            ...previousPagination,
            totalCount: Math.max(previousPagination.totalCount - 1, 0),
          };
        });
      } catch {
        // toast.error('Không thể thêm moderator');
      } finally {
        setProcessingUserId(null);
      }
    },
    []
  );

  const handleConfirmAction = useCallback(async (): Promise<void> => {
    if (!selectedActionUser || !confirmActionType) {
      return;
    }

    if (confirmActionType === 'toggleBan') {
      await handleToggleBan(selectedActionUser);
    }

    if (confirmActionType === 'promoteModerator') {
      await handlePromoteModerator(selectedActionUser);
    }

    setConfirmActionType(null);
    setSelectedActionUser(null);
  }, [
    confirmActionType,
    handlePromoteModerator,
    handleToggleBan,
    selectedActionUser,
  ]);

  const confirmDialogTitle = useMemo((): string => {
    if (!selectedActionUser || !confirmActionType) {
      return '';
    }

    if (confirmActionType === 'toggleBan') {
      return isUserBanned(selectedActionUser)
        ? 'Xác nhận bỏ chặn tài khoản'
        : 'Xác nhận chặn tài khoản';
    }

    return 'Xác nhận thêm moderator';
  }, [confirmActionType, selectedActionUser]);

  const confirmDialogMessage = useMemo((): string => {
    if (!selectedActionUser || !confirmActionType) {
      return '';
    }

    if (confirmActionType === 'toggleBan') {
      return isUserBanned(selectedActionUser)
        ? `Bạn có chắc muốn bỏ chặn người dùng ${selectedActionUser.userName}?`
        : `Bạn có chắc muốn chặn người dùng ${selectedActionUser.userName}?`;
    }

    return `Bạn có chắc muốn thêm ${selectedActionUser.userName} thành moderator?`;
  }, [confirmActionType, selectedActionUser]);

  const confirmButtonLabel = useMemo((): string => {
    if (!selectedActionUser || !confirmActionType) {
      return 'Xác nhận';
    }

    if (confirmActionType === 'toggleBan') {
      return isUserBanned(selectedActionUser) ? 'Bỏ chặn' : 'Chặn';
    }

    return 'Thêm Moderator';
  }, [confirmActionType, selectedActionUser]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{pageTitle}</h1>

      <Box className="mb-4 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-table-text-primary text-sm font-bold tracking-wide uppercase">
            Bộ lọc người dùng
          </p>
          <Button
            variant="text"
            size="small"
            startIcon={<FilterAltOffIcon fontSize="small" />}
            onClick={() => setSearchKeyword('')}
            disabled={searchKeyword.trim().length === 0}
          >
            Bỏ lọc
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <UserSearchableSelect
              value={searchKeyword}
              onChange={setSearchKeyword}
              roleFilterLabel={roleFilterLabel}
            />
          </div>
        </div>
      </Box>

      <AdminUsersTable
        users={users}
        loading={loading}
        roleFilter={roleFilter}
        processingUserId={processingUserId}
        onToggleBan={handleOpenConfirmToggleBan}
        onPromoteModerator={handleOpenConfirmPromoteModerator}
      />

      <Dialog
        open={confirmActionType !== null}
        onClose={handleCloseConfirmDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{confirmDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDialog}
            disabled={processingUserId !== null}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={() => {
              void handleConfirmAction();
            }}
            disabled={processingUserId !== null}
            color={confirmActionType === 'toggleBan' ? 'warning' : 'info'}
            variant="outlined"
          >
            {confirmButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize): void => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />
    </div>
  );
}
