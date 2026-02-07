import { useState } from 'react';
import React from 'react';
import Table from '@features/admin/components/Table';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function VendorVerification(): React.JSX.Element {
  const [loading] = useState(false);

  // Mock data cho xác minh người bán
  const vendorData = [
    {
      id: 1,
      ownerName: 'Nguyễn Văn A',
      status: 'pending',
      licenseUrl: 'https://example.com/license1.pdf',
      processedBy: null,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      ownerName: 'Trần Thị B',
      status: 'verified',
      licenseUrl: 'https://example.com/license2.pdf',
      processedBy: 'Admin Nguyễn',
      createdAt: '2024-02-20T14:15:00',
      updatedAt: '2024-02-22T09:20:00',
    },
    {
      id: 3,
      ownerName: 'Lê Văn C',
      status: 'pending payment',
      licenseUrl: 'https://example.com/license3.pdf',
      processedBy: null,
      createdAt: '2024-03-10T08:45:00',
      updatedAt: '2024-03-10T08:45:00',
    },
    {
      id: 4,
      ownerName: 'Phạm Thị D',
      status: 'reject',
      licenseUrl: 'https://example.com/license4.pdf',
      processedBy: 'Admin Trần',
      createdAt: '2024-03-05T16:00:00',
      updatedAt: '2024-03-06T10:30:00',
    },
  ];

  const getStatusBadge = (status: string): React.JSX.Element => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Chờ duyệt',
      },
      'pending payment': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Chờ thanh toán',
      },
      verified: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Đã xác minh',
      },
      reject: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    };

    const config = statusConfig[status] ?? {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      label: 'STT',
      render: (_: unknown, row: Record<string, unknown>, index?: number) => (index ?? 0) + 1,
    },
    {
      key: 'ownerName',
      label: 'Tên chủ cửa hàng',
      className: 'font-medium',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: unknown): React.JSX.Element => getStatusBadge(value as string),
    },
    {
      key: 'licenseUrl',
      label: 'Giấy phép',
      render: (value: unknown): React.JSX.Element => (
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Xem file
        </a>
      ),
    },
    {
      key: 'processedBy',
      label: 'Người xử lý',
      render: (value: unknown): string => (value as string | null) ?? '-',
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (value: unknown): string => new Date(value as string).toLocaleString('vi-VN'),
    },
    {
      key: 'updatedAt',
      label: 'Ngày cập nhật',
      render: (value: unknown): string => new Date(value as string).toLocaleString('vi-VN'),
    },
  ];

  const actions = [
    {
      label: (
        <Tooltip title="Xem chi tiết">
          <IconButton size="small" color="primary">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => console.log('View:', row),
    },
    {
      label: (
        <Tooltip title="Chỉnh sửa">
          <IconButton size="small" color="success">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => console.log('Edit:', row),
    },
    {
      label: (
        <Tooltip title="Xóa">
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => console.log('Delete:', row),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Xác minh người bán</h1>
      <Table
        columns={columns}
        data={vendorData}
        loading={loading}
        rowKey="id"
        actions={actions}
        emptyMessage="Chưa có yêu cầu xác minh nào"
        loadingMessage="Đang tải danh sách..."
      />
    </div>
  );
}
