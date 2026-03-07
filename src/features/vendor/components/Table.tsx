/* eslint-disable @typescript-eslint/no-base-to-string */
import { useState } from 'react';
import type { JSX } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index?: number) => React.ReactNode;
  style?: React.CSSProperties;
}

interface Action<T> {
  label: string | React.ReactNode;
  menuLabel?: string;
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
  maxHeight?: string | 'none';
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
  const [menuState, setMenuState] = useState<{
    anchorEl: HTMLElement | null;
    row: T | null;
  }>({ anchorEl: null, row: null });

  return (
    <>
      <TableContainer
        component={Paper}
        className="border-table-border rounded-lg border shadow-sm"
        style={{ maxHeight: maxHeight === 'none' ? undefined : maxHeight }}
      >
        <MuiTable stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className="border-table-divider bg-table-header-bg text-table-header-text border-b text-xs font-semibold tracking-wide uppercase"
                  style={{ ...column.style }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell className="border-table-divider bg-table-header-bg text-table-header-text border-b text-xs font-semibold tracking-wide uppercase">
                  Thao tác
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  className="py-8"
                >
                  <Box className="flex flex-col items-center gap-4">
                    <CircularProgress size={32} />
                    <Typography className="text-table-text-secondary">
                      {loadingMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  className="py-8"
                >
                  <Typography className="text-table-text-secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data
                .filter((row) => row != null)
                .map((row, rowIndex) => {
                  const rowKeyValue = (row as Record<string, unknown>)[rowKey];
                  if (!rowKeyValue) return null;

                  return (
                    <TableRow
                      key={String(rowKeyValue)}
                      hover
                      onClick={() => onRowClick?.(row)}
                      className={`hover:bg-table-row-hover last:[&_td]:border-0 last:[&_th]:border-0 ${onRowClick ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{ height: '60px' }}
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
                            className="border-table-divider text-table-text-primary border-b text-sm whitespace-nowrap"
                            style={{
                              ...column.style,
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              verticalAlign: 'middle',
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
                          className="border-table-divider border-b"
                          style={{
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            verticalAlign: 'middle',
                            width: '48px',
                          }}
                        >
                          <Tooltip title="Xem thêm" placement="top" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuState({
                                  anchorEl: e.currentTarget,
                                  row,
                                });
                              }}
                            >
                              <MoreHorizIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {actions && actions.length > 0 && (
        <Menu
          anchorEl={menuState.anchorEl}
          open={Boolean(menuState.anchorEl)}
          onClose={() => setMenuState({ anchorEl: null, row: null })}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {actions.map((action, index) => (
            <MenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (menuState.row) action.onClick(menuState.row);
                setMenuState({ anchorEl: null, row: null });
              }}
              sx={{
                gap: 1.5,
                color: action.color ? `${action.color}.main` : 'text.primary',
                minWidth: 180,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {action.label}
                {action.menuLabel && (
                  <Typography variant="body2">{action.menuLabel}</Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default Table;
