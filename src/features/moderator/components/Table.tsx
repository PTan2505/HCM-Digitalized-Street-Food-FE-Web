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

interface Column {
  key: string;
  label: string;
  render?: (
    value: unknown,
    row: Record<string, unknown>,
    index?: number
  ) => React.ReactNode;
  style?: React.CSSProperties;
}

interface Action {
  label: string | React.ReactNode;
  onClick: (row: Record<string, unknown>) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'text' | 'outlined' | 'contained';
}

interface TableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  rowKey?: string;
  maxHeight?: string;
  actions?: Action[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  loadingMessage = 'Đang tải...',
  rowKey = 'id',
  maxHeight = '600px',
  actions,
  onRowClick,
}: TableProps): JSX.Element => {
  const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0);

  return (
    <TableContainer
      component={Paper}
      className="rounded-lg border border-[var(--color-table-border)] font-[var(--font-nunito)] shadow-sm"
      style={{ maxHeight }}
    >
      <MuiTable stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className="border-b border-[var(--color-table-divider)] bg-[var(--color-table-header-bg)] text-xs font-[var(--font-nunito)] font-semibold tracking-wide text-[var(--color-table-header-text)] uppercase"
                style={{ ...column.style }}
              >
                {column.label}
              </TableCell>
            ))}
            {actions && actions.length > 0 && (
              <TableCell className="border-b border-[var(--color-table-divider)] bg-[var(--color-table-header-bg)] text-xs font-[var(--font-nunito)] font-semibold tracking-wide text-[var(--color-table-header-text)] uppercase">
                Thao tác
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" className="py-8">
                <Box className="flex flex-col items-center gap-4">
                  <CircularProgress size={32} />
                  <Typography className="font-[var(--font-nunito)] text-[var(--color-table-text-secondary)]">
                    {loadingMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" className="py-8">
                <Typography className="font-[var(--font-nunito)] text-[var(--color-table-text-secondary)]">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={String(row[rowKey])}
                hover
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-[var(--color-table-row-hover)] last:[&_td]:border-0 last:[&_th]:border-0 ${onRowClick ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {columns.map((column) => {
                  const value = column.key
                    .split('.')
                    .reduce<unknown>((obj, key) => {
                      if (obj && typeof obj === 'object' && key in obj) {
                        return (obj as Record<string, unknown>)[key];
                      }
                      return undefined;
                    }, row);
                  return (
                    <TableCell
                      key={column.key}
                      className="border-b border-[var(--color-table-divider)] text-sm font-[var(--font-nunito)] whitespace-nowrap text-[var(--color-table-text-primary)]"
                      style={{ ...column.style }}
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : String(value ?? '-')}
                    </TableCell>
                  );
                })}
                {actions && actions.length > 0 && (
                  <TableCell className="border-b border-[var(--color-table-divider)] whitespace-nowrap">
                    <Box className="flex gap-2">
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
                          className="font-[var(--font-nunito)]"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

export default Table;
