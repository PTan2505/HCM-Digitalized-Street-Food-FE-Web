import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import type { Branch, UserSearchItem } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor } from '@slices/vendor';

interface BranchManagerModalProps {
  isOpen: boolean;
  branch: Branch | null;
  onClose: () => void;
  onAssigned?: () => void;
}

export default function BranchManagerModal({
  isOpen,
  branch,
  onClose,
  onAssigned,
}: BranchManagerModalProps): JSX.Element {
  const { onSearchUsers, onUpdateBranchManager } = useVendor();
  const myVendor = useAppSelector(selectMyVendor);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const managedBranchNameByUserId = useMemo(() => {
    const map = new Map<number, string>();

    (myVendor?.branches ?? []).forEach((vendorBranch) => {
      map.set(vendorBranch.managerId, vendorBranch.name);
    });

    return map;
  }, [myVendor?.branches]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setUsers([]);
      setErrorMessage(null);
      setAssigningUserId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      const fetchUsers = async (): Promise<void> => {
        setSearching(true);
        setErrorMessage(null);

        try {
          const response = await onSearchUsers({
            query: trimmedQuery,
            pageNumber: 1,
            pageSize: 10,
          });
          setUsers(response.items ?? []);
        } catch {
          setUsers([]);
          //   setErrorMessage('Không thể tìm người dùng. Vui lòng thử lại.');
        } finally {
          setSearching(false);
        }
      };

      void fetchUsers();
    }, 300);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onSearchUsers, trimmedQuery]);

  const handleSelectManager = async (user: UserSearchItem): Promise<void> => {
    if (!branch) return;

    setAssigningUserId(user.id);
    setErrorMessage(null);

    try {
      await onUpdateBranchManager({
        branchId: branch.branchId,
        data: { managerId: user.id },
      });
      onAssigned?.();
      onClose();
    } catch {
      setErrorMessage('Cập nhật quản lý thất bại. Vui lòng thử lại.');
    } finally {
      setAssigningUserId(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="update-manager-dialog-title"
    >
      <VendorModalHeader
        title="Cập nhật người quản lý"
        subtitle={branch?.name ?? '-'}
        icon={<ManageAccountsIcon />}
        iconTone="branch"
        onClose={onClose}
      />
      <DialogContent className="flex flex-col gap-4">
        <TextField
          fullWidth
          size="small"
          label="Tìm kiếm người dùng"
          placeholder="Nhập tên, email hoặc số điện thoại"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{
            '& .MuiInputLabel-root': {
              color: 'var(--color-primary-600)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--color-primary-600)',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--color-primary-600)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--color-primary-600)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-primary-600)',
              },
            },
          }}
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searching ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box className="flex items-center justify-center py-4">
                      <CircularProgress size={22} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Không có người dùng phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isAssigning = assigningUserId === user.id;
                  const assignedBranchName = managedBranchNameByUserId.get(
                    user.id
                  );
                  const isAlreadyManager =
                    typeof assignedBranchName === 'string';
                  let selectButtonLabel = 'Chọn';

                  if (isAssigning) {
                    selectButtonLabel = 'Đang cập nhật...';
                  } else if (isAlreadyManager) {
                    selectButtonLabel = 'Đang quản lý';
                  }

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.userName ?? '-'}</TableCell>
                      <TableCell>{user.email ?? '-'}</TableCell>
                      <TableCell>{user.phoneNumber ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Box className="flex flex-col items-end gap-1">
                          <Button
                            variant={isAlreadyManager ? 'text' : 'outlined'}
                            size="small"
                            disabled={
                              assigningUserId !== null || isAlreadyManager
                            }
                            onClick={() => void handleSelectManager(user)}
                            sx={{
                              minWidth: 140,
                              fontWeight: 700,
                              ...(isAlreadyManager
                                ? {
                                    borderRadius: '9999px',
                                    border: '1px solid #f59e0b',
                                    color: '#b45309',
                                    backgroundColor: '#fffbeb',
                                    '&.Mui-disabled': {
                                      border: '1px solid #f59e0b',
                                      color: '#b45309',
                                      backgroundColor: '#fffbeb',
                                    },
                                  }
                                : {
                                    borderColor: 'var(--color-primary-500)',
                                    color: 'var(--color-primary-700)',
                                    '&:hover': {
                                      borderColor: 'var(--color-primary-700)',
                                      backgroundColor:
                                        'var(--color-primary-50)',
                                    },
                                    '&.Mui-disabled': {
                                      borderColor: '#cbd5e1',
                                      color: '#64748b',
                                    },
                                  }),
                            }}
                          >
                            {selectButtonLabel}
                          </Button>

                          {isAlreadyManager && assignedBranchName ? (
                            <Typography className="text-xs font-medium text-amber-700">
                              Chi nhánh: {assignedBranchName}
                            </Typography>
                          ) : null}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
