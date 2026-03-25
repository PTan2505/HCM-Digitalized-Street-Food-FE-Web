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
  DialogTitle,
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
import type { Branch, UserSearchItem } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';

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
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

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
      <DialogTitle id="update-manager-dialog-title">
        Cập nhật người quản lý
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <Typography variant="body2" color="text.secondary">
          Chi nhánh: {branch?.name ?? '-'}
        </Typography>

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
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.userName ?? '-'}</TableCell>
                      <TableCell>{user.email ?? '-'}</TableCell>
                      <TableCell>{user.phoneNumber ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={assigningUserId !== null}
                          onClick={() => void handleSelectManager(user)}
                        >
                          {isAssigning ? 'Đang cập nhật...' : 'Chọn'}
                        </Button>
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
