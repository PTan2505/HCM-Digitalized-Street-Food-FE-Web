import type { JSX } from 'react';
import { Box, Button, Select, MenuItem, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from '@mui/icons-material';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasPrevious,
  hasNext,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps): JSX.Element {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePageSizeChange = (event: SelectChangeEvent<number>): void => {
    onPageSizeChange?.(Number(event.target.value));
  };

  const getVisiblePages = (): number[] => {
    const maxVisible = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Box className="border-table-border mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3">
      {/* Left: Info & Page size */}
      <Box className="flex items-center gap-4">
        {onPageSizeChange && (
          <Box className="flex items-center gap-4">
            <Typography className="text-table-text-secondary text-sm whitespace-nowrap">
              Số dòng:
            </Typography>
            <Select
              size="small"
              value={pageSize}
              onChange={handlePageSizeChange}
              sx={{
                minWidth: 70,
                height: 32,
                fontSize: '0.875rem',
              }}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        <Typography className="text-table-text-secondary text-sm">
          {startItem}–{endItem} / {totalCount} kết quả
        </Typography>
      </Box>

      {/* Right: Page navigation */}
      <Box className="flex items-center gap-1">
        <Button
          size="small"
          variant="outlined"
          disabled={!hasPrevious}
          onClick={() => onPageChange(1)}
          sx={{ minWidth: 36, height: 36, padding: 0 }}
        >
          <FirstPageIcon fontSize="small" />
        </Button>

        <Button
          size="small"
          variant="outlined"
          disabled={!hasPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          sx={{ minWidth: 36, height: 36, padding: 0 }}
        >
          <ChevronLeftIcon fontSize="small" />
        </Button>

        {visiblePages[0] > 1 && (
          <Typography className="text-table-text-secondary px-1 text-sm">
            ...
          </Typography>
        )}

        {visiblePages.map((page) => (
          <Button
            key={page}
            size="small"
            variant={page === currentPage ? 'contained' : 'outlined'}
            onClick={() => onPageChange(page)}
            sx={{
              minWidth: 36,
              height: 36,
              padding: 0,
              fontWeight: page === currentPage ? 700 : 400,
            }}
          >
            {page}
          </Button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <Typography className="text-table-text-secondary px-1 text-sm">
            ...
          </Typography>
        )}

        <Button
          size="small"
          variant="outlined"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          sx={{ minWidth: 36, height: 36, padding: 0 }}
        >
          <ChevronRightIcon fontSize="small" />
        </Button>

        <Button
          size="small"
          variant="outlined"
          disabled={!hasNext}
          onClick={() => onPageChange(totalPages)}
          sx={{ minWidth: 36, height: 36, padding: 0 }}
        >
          <LastPageIcon fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
}
