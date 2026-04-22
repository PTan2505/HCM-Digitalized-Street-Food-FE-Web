import Pagination from '@features/admin/components/Pagination';
import Table from '@features/admin/components/Table';
import useVendor from '@features/admin/hooks/useVendor';
import type { AdminVendor } from '@features/admin/types/vendor';
import { getAdminVendorCampaignTourSteps } from '@features/admin/utils/adminVendorCampaignTourSteps';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  FilterAltOff as FilterAltOffIcon,
  HelpOutline as HelpOutlineIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  getVendorCampaigns,
  selectCampaignStatus,
  selectVendorCampaigns,
  selectVendorCampaignTotalCount,
} from '@slices/campaign';
import type { JSX } from 'react';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  EVENTS,
  Joyride,
  STATUS,
  type Controls,
  type EventData,
} from 'react-joyride';

interface AdminVendorCampaignRow {
  campaignId: number;
  createdByVendorId: number | null;
  createdAt: string;
  name: string;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const formatVNDatetime = (isoStr: string | null): string => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatusBadge = ({
  startDate,
  endDate,
}: {
  startDate: string | null;
  endDate: string | null;
}): JSX.Element => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const hasValidStart = start !== null && !Number.isNaN(start.getTime());
  const hasValidEnd = end !== null && !Number.isNaN(end.getTime());

  const status = !hasValidStart
    ? {
        label: 'Chưa diễn ra',
        tone: 'bg-sky-100 text-sky-700 border-sky-200',
      }
    : now < start
      ? {
          label: 'Chưa diễn ra',
          tone: 'bg-sky-100 text-sky-700 border-sky-200',
        }
      : hasValidEnd && now > end
        ? {
            label: 'Đã kết thúc',
            tone: 'bg-slate-100 text-slate-700 border-slate-200',
          }
        : {
            label: 'Đang hoạt động',
            tone: 'bg-green-100 text-green-700 border-green-200',
          };

  return (
    <span
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${status.tone}`}
    >
      {status.label}
    </span>
  );
};

export default function AdminVendorCampaignPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { onGetAllVendors } = useVendor();
  const campaigns = useAppSelector(selectVendorCampaigns);
  const totalCount = useAppSelector(selectVendorCampaignTotalCount);
  const status = useAppSelector(selectCampaignStatus);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [vendorOptions, setVendorOptions] = useState<AdminVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(
    null
  );
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [campaignKeyword, setCampaignKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [createdFilter, setCreatedFilter] = useState<
    'all' | 'today' | '7days' | '30days'
  >('all');
  const deferredCampaignKeyword = useDeferredValue(campaignKeyword);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  // const createdFilterOptions: Array<{
  //   value: 'all' | 'today' | '7days' | '30days';
  //   label: string;
  // }> = [
  //   { value: 'all', label: 'Tất cả thời gian' },
  //   { value: 'today', label: '24 giờ qua' },
  //   { value: '7days', label: '7 ngày qua' },
  //   { value: '30days', label: '30 ngày qua' },
  // ];

  const fetchVendors = useCallback(async (): Promise<void> => {
    setIsLoadingVendors(true);
    try {
      const response = await onGetAllVendors({ pageNumber: 1, pageSize: 200 });
      setVendorOptions(response.items ?? []);
    } catch (error) {
      console.error('Failed to fetch vendors for filter', error);
      setVendorOptions([]);
    } finally {
      setIsLoadingVendors(false);
    }
  }, [onGetAllVendors]);

  useEffect(() => {
    void fetchVendors();
  }, [fetchVendors]);

  const fetchVendorCampaigns = useCallback(async (): Promise<void> => {
    if (!selectedVendor?.vendorId) {
      return;
    }

    try {
      await dispatch(
        getVendorCampaigns({
          pageNumber: page,
          pageSize,
          vendorId: selectedVendor.vendorId,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendor campaigns', error);
    }
  }, [dispatch, page, pageSize, selectedVendor?.vendorId]);

  useEffect(() => {
    void fetchVendorCampaigns();
  }, [fetchVendorCampaigns]);

  useEffect(() => {
    setPage(1);
  }, [selectedVendor?.vendorId]);

  useEffect(() => {
    setPage(1);
  }, [campaignKeyword, statusFilter, createdFilter]);

  const filterInputSx = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-primary-300)',
      transition: 'border-color 180ms ease, box-shadow 180ms ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-primary-500)',
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-primary-600)',
      borderWidth: '2px',
      boxShadow: '0 0 0 2px rgba(122, 184, 45, 0.12)',
    },
    '& .MuiInputLabel-root': {
      color: '#5f9324',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#5f9324',
    },
  } as const;

  const filteredCampaigns = useMemo((): AdminVendorCampaignRow[] => {
    const keyword = deferredCampaignKeyword.trim().toLowerCase();
    const now = Date.now();

    return (campaigns as unknown as AdminVendorCampaignRow[]).filter(
      (campaign) => {
        const matchesKeyword =
          keyword === '' || campaign.name.toLowerCase().includes(keyword);

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && campaign.isActive) ||
          (statusFilter === 'inactive' && !campaign.isActive);

        const createdAtTime = new Date(campaign.createdAt).getTime();
        const isValidCreatedAt = !Number.isNaN(createdAtTime);

        const matchesCreated =
          createdFilter === 'all' ||
          (createdFilter === 'today' &&
            isValidCreatedAt &&
            now - createdAtTime <= 24 * 60 * 60 * 1000) ||
          (createdFilter === '7days' &&
            isValidCreatedAt &&
            now - createdAtTime <= 7 * 24 * 60 * 60 * 1000) ||
          (createdFilter === '30days' &&
            isValidCreatedAt &&
            now - createdAtTime <= 30 * 24 * 60 * 60 * 1000);

        return matchesKeyword && matchesStatus && matchesCreated;
      }
    );
  }, [campaigns, createdFilter, deferredCampaignKeyword, statusFilter]);

  const columns = [
    {
      key: 'name',
      label: 'Tên chiến dịch',
      render: (value: unknown): JSX.Element => (
        <Box className="text-table-text-primary font-semibold">
          {typeof value === 'string' ? value : String(value)}
        </Box>
      ),
    },
    {
      key: 'creator',
      label: 'Nguồn tạo',
      render: (_: unknown, row: AdminVendorCampaignRow): JSX.Element => {
        if (!row.createdByVendorId) {
          return (
            <span className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 shadow-sm">
              Từ hệ thống
            </span>
          );
        }

        return (
          <span className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 shadow-sm">
            Từ cửa hàng
          </span>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: AdminVendorCampaignRow): JSX.Element => (
        <Box className="text-table-text-secondary text-sm">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'targetSegment',
      label: 'Phân khúc',
      render: (value: unknown): JSX.Element => (
        <Box className="text-table-text-primary">
          {typeof value === 'string' && value.trim().length > 0 ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'isActive',
      label: 'Tình trạng',
      render: (_: unknown, row: AdminVendorCampaignRow): JSX.Element => (
        <StatusBadge startDate={row.startDate} endDate={row.endDate} />
      ),
    },
  ];

  const hasActiveAdvancedFilters =
    campaignKeyword.trim() !== '' ||
    statusFilter !== 'all' ||
    createdFilter !== 'all';

  const handleResetAllFilters = (): void => {
    setSelectedVendor(null);
    setCampaignKeyword('');
    setStatusFilter('all');
    setCreatedFilter('all');
    setPage(1);
  };

  const startTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getAdminVendorCampaignTourSteps({
      hasSelectedVendor: Boolean(selectedVendor?.vendorId),
      hasRows: filteredCampaigns.length > 0,
    });
  }, [filteredCampaigns.length, selectedVendor?.vendorId]);

  return (
    <div className="flex h-full flex-col font-(--font-nunito)">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      <div
        className="mb-6 flex items-center justify-between"
        data-tour="admin-vendor-campaign-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Chiến dịch từ cửa hàng
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn chiến dịch từ cửa hàng"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Danh sách chiến dịch được tạo từ cửa hàng
          </p>
        </div>
      </div>

      <Box
        className="mb-4 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-white p-4 shadow-sm"
        data-tour="admin-vendor-campaign-filters"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-table-text-primary text-sm font-bold tracking-wide uppercase">
            Bộ lọc chiến dịch
          </p>
          <Button
            variant="text"
            size="small"
            startIcon={<FilterAltOffIcon fontSize="small" />}
            onClick={handleResetAllFilters}
            disabled={!selectedVendor && !hasActiveAdvancedFilters}
          >
            Đặt lại tất cả
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Autocomplete
              options={vendorOptions}
              value={selectedVendor}
              loading={isLoadingVendors}
              onChange={(_, value) => setSelectedVendor(value)}
              getOptionLabel={(option) => `${option.name}`}
              isOptionEqualToValue={(option, value) =>
                option.vendorId === value.vendorId
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cửa hàng"
                  placeholder="Tìm theo tên cửa hàng"
                  size="small"
                  sx={filterInputSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingVendors ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </div>

          <div className="lg:col-span-4">
            <TextField
              value={campaignKeyword}
              onChange={(event) => setCampaignKeyword(event.target.value)}
              label="Tên chiến dịch"
              placeholder="Nhập từ khóa tìm kiếm"
              size="small"
              fullWidth
              sx={filterInputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="lg:col-span-3">
            <FormControl size="small" fullWidth sx={filterInputSx}>
              <InputLabel id="campaign-status-filter-label">
                Trạng thái
              </InputLabel>
              <Select
                labelId="campaign-status-filter-label"
                value={statusFilter}
                label="Trạng thái"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Đã kết thúc</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* <div className="mt-3 flex flex-wrap items-center gap-2">
          {createdFilterOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              clickable
              onClick={() => setCreatedFilter(option.value)}
              color={createdFilter === option.value ? 'primary' : 'default'}
              variant={createdFilter === option.value ? 'filled' : 'outlined'}
              size="small"
              sx={{
                transition: 'all 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                borderColor:
                  createdFilter === option.value
                    ? 'var(--color-primary-600)'
                    : 'var(--color-primary-300)',
                '&:hover': {
                  borderColor: 'var(--color-primary-500)',
                },
              }}
            />
          ))}
        </div> */}

        {/* <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
            Tổng chiến dịch: {totalCount ?? 0}
          </span>
          <span className="border-primary-200 bg-primary-50 text-primary-700 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold">
            Sau lọc: {filteredCampaigns.length}
          </span>
          {selectedVendor && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Cửa hàng: {selectedVendor.name}
            </span>
          )}
        </div> */}
      </Box>

      <Box
        sx={{ flex: 1, minHeight: 0 }}
        data-tour="admin-vendor-campaign-table"
      >
        <Table
          columns={columns}
          data={filteredCampaigns}
          rowKey="campaignId"
          loading={status === 'pending' && Boolean(selectedVendor?.vendorId)}
          emptyMessage={
            selectedVendor?.vendorId
              ? 'Không có chiến dịch phù hợp bộ lọc'
              : 'Vui lòng chọn cửa hàng để xem chiến dịch'
          }
        />
      </Box>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil((totalCount ?? 0) / pageSize)}
        totalCount={totalCount ?? 0}
        pageSize={pageSize}
        hasPrevious={page > 1}
        hasNext={page < Math.ceil((totalCount ?? 0) / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />
    </div>
  );
}
