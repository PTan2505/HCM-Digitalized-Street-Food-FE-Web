import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { selectGhostPins, selectGhostPinsPagination } from '@slices/vendor';
import useVendor from '../hooks/useVendor';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ClaimBranchModal from '../components/ClaimBranchModal';
import type { GhostPin } from '../types/vendor';

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default function GhostPinPage(): JSX.Element {
  const { onGetAllGhostPins } = useVendor();
  const ghostPins = useSelector(selectGhostPins);
  const pagination = useSelector(selectGhostPinsPagination);

  const [selectedBranch, setSelectedBranch] = useState<GhostPin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchGhostPins = async (): Promise<void> => {
      setLoading(true);
      try {
        await onGetAllGhostPins({ pageNumber, pageSize });
      } finally {
        setLoading(false);
      }
    };
    void fetchGhostPins();
  }, [onGetAllGhostPins, pageNumber, pageSize]);

  const handlePageChange = (page: number): void => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setPageNumber(1);
  };

  const columns = [
    { key: 'name', label: 'Tên quán' },
    { key: 'addressDetail', label: 'Địa chỉ chi tiết' },
    { key: 'ward', label: 'Phường/Xã' },
    { key: 'city', label: 'Thành phố' },
    {
      key: 'avgRating',
      label: 'Đánh giá',
      render: (val: unknown): string =>
        typeof val === 'number' && val > 0 ? `${val} ⭐` : 'Chưa có',
    },
    {
      key: 'isVerified',
      label: 'Trạng thái',
      render: (val: unknown): JSX.Element => (
        <StatusBadge
          label={val ? 'Đã xác thực' : 'Chưa xác thực'}
          type={val ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_val: unknown, row: GhostPin): JSX.Element => (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setSelectedBranch(row);
            setIsModalOpen(true);
          }}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '0.5rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
            },
          }}
        >
          Nhận quán
        </Button>
      ),
    },
  ];

  return (
    <div className="font-(--font-nunito)">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Danh sách quán do reviewers chia sẻ
          </h1>
          <p className="text-table-text-secondary text-sm">
            Danh sách các quán do reviewers chia sẻ chưa có chủ sở hữu
          </p>
        </div>
      </div>

      <Table<GhostPin>
        columns={columns}
        data={ghostPins}
        rowKey="branchId"
        loading={loading}
        emptyMessage="Hiện tại không có quán nào để nhận."
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <ClaimBranchModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={selectedBranch}
      />
    </div>
  );
}
