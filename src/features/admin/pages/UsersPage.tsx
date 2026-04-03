import Pagination from '@features/admin/components/Pagination';
import AdminUsersTable from '@features/admin/components/AdminUsersTable';
import UserSearchableSelect from '@features/admin/components/UserSearchableSelect';
import type {
  AdminUserItem,
  GetUsersResponse,
  UserRoleFilter,
} from '@features/admin/types/userManagement';
import { axiosApi } from '@lib/api/apiInstance';
import { Box, Button } from '@mui/material';
import { FilterAltOff as FilterAltOffIcon } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useLocation } from 'react-router-dom';

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

  const handleToggleBan = useCallback(
    async (user: AdminUserItem): Promise<void> => {
      const banned =
        user.isBanned ??
        user.banned ??
        user.isBlocked ??
        user.status?.toLowerCase() === 'banned';
      setProcessingUserId(user.id);

      try {
        if (banned) {
          await axiosApi.userAdminApi.unbanUser(user.id);
        } else {
          await axiosApi.userAdminApi.banUser(user.id);
        }

        await loadUsers();
      } catch {
        // toast.error('Không thể cập nhật trạng thái chặn');
      } finally {
        setProcessingUserId(null);
      }
    },
    [loadUsers]
  );

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
        onToggleBan={handleToggleBan}
      />

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
