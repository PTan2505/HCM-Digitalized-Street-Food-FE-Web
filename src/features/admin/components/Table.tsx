/* eslint-disable @typescript-eslint/no-base-to-string */
import type { JSX } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index?: number) => React.ReactNode;
  sx?: object;
}

interface Action<T> {
  label: string | React.ReactNode;
  onClick: (row: T) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'text' | 'outlined' | 'contained';
}

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  rowKey?: string;
  maxHeight?: string;
  actions?: Action<T>[];
  onRowClick?: (row: T) => void;
}

const Table = <T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  loadingMessage = 'Đang tải...',
  rowKey = 'id',
  maxHeight = '600px',
  actions,
  onRowClick,
}: TableProps<T>): JSX.Element => {
  const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight,
        boxShadow: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'var(--color-table-border)',
        fontFamily: 'var(--font-nunito)',
      }}
    >
      <MuiTable stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  bgcolor: 'var(--color-table-header-bg)',
                  color: 'var(--color-table-header-text)',
                  fontFamily: 'var(--font-nunito)',
                  borderBottom: '1px solid var(--color-table-divider)',
                  ...column.sx,
                }}
              >
                {column.label}
              </TableCell>
            ))}
            {actions && actions.length > 0 && (
              <TableCell
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  bgcolor: 'var(--color-table-header-bg)',
                  color: 'var(--color-table-header-text)',
                  fontFamily: 'var(--font-nunito)',
                  borderBottom: '1px solid var(--color-table-divider)',
                }}
              >
                Thao tác
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography
                    color="var(--color-table-text-secondary)"
                    sx={{ fontFamily: 'var(--font-nunito)' }}
                  >
                    {loadingMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                <Typography
                  color="var(--color-table-text-secondary)"
                  sx={{ fontFamily: 'var(--font-nunito)' }}
                >
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => {
              const rowKeyValue = (row as Record<string, unknown>)[rowKey];
              if (!rowKeyValue) return null;

              return (
                <TableRow
                  key={String(rowKeyValue)}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      bgcolor: 'var(--color-table-row-hover)',
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = column.key.split('.').reduce<unknown>(
                      (obj, key) => {
                        if (obj && typeof obj === 'object' && key in obj) {
                          return (obj as Record<string, unknown>)[key];
                        }
                        return undefined;
                      },
                      row as Record<string, unknown>
                    );
                    return (
                      <TableCell
                        key={column.key}
                        sx={{
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          color: 'var(--color-table-text-primary)',
                          fontFamily: 'var(--font-nunito)',
                          borderBottom: '1px solid var(--color-table-divider)',
                          ...column.sx,
                        }}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : String(value ?? '-')}
                      </TableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid var(--color-table-divider)',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {actions.map((action, index) => (
                          <Button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            color={action.color ?? 'primary'}
                            variant={action.variant ?? 'text'}
                            size="small"
                            sx={{ fontFamily: 'var(--font-nunito)' }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

export default Table;
