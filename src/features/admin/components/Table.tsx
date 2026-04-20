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
  Button,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index?: number) => React.ReactNode;
  style?: React.CSSProperties;
}

interface Action<T> {
  id?: string;
  label: string | React.ReactNode | ((row: T) => React.ReactNode);
  menuLabel?: React.ReactNode;
  onClick: (row: T) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'text' | 'outlined' | 'contained';
  tooltip?: string;
  show?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
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
  groupActionsInMenu?: boolean;
  onRowClick?: (row: T) => void;
  noActionsMessage?: React.ReactNode;
  tourId?: string;
}

interface MenuState<T> {
  anchorEl: HTMLElement | null;
  row: T | null;
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
  groupActionsInMenu = false,
  onRowClick,
  noActionsMessage = '-',
  tourId,
}: TableProps<T>): JSX.Element => {
  const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0);
  const [menuState, setMenuState] = useState<MenuState<T>>({
    anchorEl: null,
    row: null,
  });

  const closeMenu = (): void => {
    setMenuState((prev) => ({ ...prev, anchorEl: null }));
  };

  const clearMenuRow = (): void => {
    setMenuState((prev) => ({ ...prev, row: null }));
  };

  return (
    <>
      <TableContainer
        component={Paper}
        className="border-table-border rounded-lg border shadow-sm"
        data-tour-table={tourId}
        style={{
          maxHeight: maxHeight === 'none' ? undefined : maxHeight,
          overflowY: maxHeight === 'none' ? undefined : 'auto',
        }}
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
                      data-tour-row-index={rowIndex}
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
                          className="border-table-divider border-b whitespace-nowrap"
                          style={{
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            verticalAlign: 'middle',
                          }}
                        >
                          {groupActionsInMenu ? (
                            (() => {
                              const visibleActions = actions.filter(
                                (action) => !action.show || action.show(row)
                              );

                              if (visibleActions.length === 0) {
                                return null;
                              }

                              return (
                                <Tooltip title="Xem thêm" placement="top" arrow>
                                  <IconButton
                                    size="small"
                                    data-tour-action-trigger={tourId}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setMenuState({
                                        anchorEl: event.currentTarget,
                                        row,
                                      });
                                    }}
                                  >
                                    <MoreHorizIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              );
                            })()
                          ) : (
                            <Box className="flex gap-2">
                              {((): React.ReactNode => {
                                const visibleActions = actions.filter(
                                  (action) => !action.show || action.show(row)
                                );
                                if (visibleActions.length === 0) {
                                  return (
                                    <span className="text-xs font-medium text-gray-400 italic">
                                      {noActionsMessage}
                                    </span>
                                  );
                                }
                                return visibleActions.map((action, index) => {
                                  const label =
                                    typeof action.label === 'function'
                                      ? action.label(row)
                                      : action.label;
                                  const actionButton = (
                                    <Box key={index}>
                                      <Button
                                        data-tour-action={
                                          tourId && action.id
                                            ? `${tourId}:${action.id}`
                                            : undefined
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          action.onClick(row);
                                        }}
                                        color={action.color ?? 'primary'}
                                        variant={action.variant ?? 'text'}
                                        size="small"
                                      >
                                        {label}
                                      </Button>
                                    </Box>
                                  );

                                  if (!action.tooltip) {
                                    return actionButton;
                                  }

                                  return (
                                    <Tooltip
                                      key={index}
                                      title={action.tooltip}
                                      arrow
                                    >
                                      {actionButton}
                                    </Tooltip>
                                  );
                                });
                              })()}
                            </Box>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {groupActionsInMenu && actions && actions.length > 0 && (
        <Menu
          anchorEl={menuState.anchorEl}
          open={Boolean(menuState.anchorEl)}
          data-tour-menu={tourId}
          onClose={closeMenu}
          TransitionProps={{
            onExited: clearMenuRow,
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.12))',
              mt: 1,
              borderRadius: '16px',
              minWidth: 240,
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 12,
                height: 12,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: '1px solid',
                borderTop: '1px solid',
                borderColor: 'divider',
              },
            },
          }}
        >
          {actions
            .filter(
              (action) =>
                !action.show ||
                (menuState.row !== null && action.show(menuState.row))
            )
            .map((action, index) => {
              const currentRow = menuState.row;
              let label: React.ReactNode;

              if (typeof action.label === 'function') {
                if (currentRow === null) {
                  return null;
                }
                label = action.label(currentRow);
              } else {
                label = action.label;
              }

              return (
                <MenuItem
                  key={index}
                  data-tour-action={
                    tourId && action.id ? `${tourId}:${action.id}` : undefined
                  }
                  disabled={
                    menuState.row !== null
                      ? (action.disabled?.(menuState.row) ?? false)
                      : false
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    if (menuState.row !== null) {
                      action.onClick(menuState.row);
                    }
                    closeMenu();
                  }}
                  sx={{
                    color: action.color
                      ? `${action.color}.main`
                      : 'text.primary',
                    borderRadius: '10px',
                    mb: 0.5,
                    px: 2,
                    py: 1.2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:last-child': {
                      mb: 0,
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        '& > svg': {
                          fontSize: '1.25rem',
                        },
                      }}
                    >
                      {label}
                    </Box>
                    {action.menuLabel && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                        }}
                      >
                        {action.menuLabel}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              );
            })}
        </Menu>
      )}
    </>
  );
};

export default Table;
