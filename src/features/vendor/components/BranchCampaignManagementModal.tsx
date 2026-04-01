// import { useCallback, useEffect, useMemo, useState } from 'react';
// import type { JSX } from 'react';
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
// } from '@mui/material';
// import { Add as AddIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
// import Table from '@features/vendor/components/Table';
// import Pagination from '@features/vendor/components/Pagination';
// import VendorCampaignFormModal from '@features/vendor/components/VendorCampaignFormModal';
// import JoinableSystemCampaignModal from '@features/vendor/components/JoinableSystemCampaignModal';
// import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
// import type { VendorCampaign } from '@features/vendor/types/campaign';
// import type { Branch } from '@features/vendor/types/vendor';
// import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';
// import { useAppSelector } from '@hooks/reduxHooks';
// import {
//   selectBranchCampaigns,
//   selectBranchCampaignTotalCount,
//   selectCampaignStatus,
// } from '@slices/campaign';

// interface BranchCampaignManagementModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   branch: Branch | null;
// }

// const formatVNDatetime = (isoStr: string | null): string => {
//   if (!isoStr) return '-';
//   const date = new Date(isoStr);
//   if (isNaN(date.getTime())) return '-';

//   return date.toLocaleString('vi-VN', {
//     timeZone: 'Asia/Ho_Chi_Minh',
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// };

// const StatusBadge = ({
//   label,
//   type,
// }: {
//   label: string;
//   type: 'success' | 'error' | 'warning' | 'default';
// }): JSX.Element => {
//   const colors = {
//     success: 'bg-green-100 text-green-700 border-green-200',
//     error: 'bg-red-100 text-red-700 border-red-200',
//     warning: 'bg-amber-100 text-amber-700 border-amber-200',
//     default: 'bg-slate-100 text-slate-700 border-slate-200',
//   };

//   return (
//     <span
//       className={`inline-flex min-w-[100px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
//     >
//       {label}
//     </span>
//   );
// };

// export default function BranchCampaignManagementModal({
//   isOpen,
//   onClose,
//   branch,
// }: BranchCampaignManagementModalProps): JSX.Element {
//   const campaigns = useAppSelector(selectBranchCampaigns);
//   const totalCount = useAppSelector(selectBranchCampaignTotalCount);
//   const status = useAppSelector(selectCampaignStatus);
//   const { onGetBranchCampaigns, onCreateBranchCampaign, onPostCampaignImage } =
//     useVendorCampaign();

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(5);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isJoinableModalOpen, setIsJoinableModalOpen] = useState(false);
//   const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

//   const branchId = branch?.branchId ?? null;

//   useEffect(() => {
//     if (isOpen) {
//       setSelectedBranchId(branchId);
//     }
//   }, [isOpen, branchId]);

//   useEffect(() => {
//     if (!isOpen) return;
//     setPage(1);
//   }, [isOpen, branchId]);

//   const fetchBranchCampaigns = useCallback(async (): Promise<void> => {
//     if (!isOpen || branchId === null) return;
//     await onGetBranchCampaigns(branchId, page, pageSize);
//   }, [isOpen, branchId, onGetBranchCampaigns, page, pageSize]);

//   useEffect(() => {
//     void fetchBranchCampaigns();
//   }, [fetchBranchCampaigns]);

//   const totalPages = useMemo(() => {
//     const pages = Math.ceil((totalCount ?? 0) / pageSize);
//     return pages > 0 ? pages : 1;
//   }, [totalCount, pageSize]);

//   const createImageFormData = (file: File): FormData => {
//     const formData = new FormData();
//     formData.append('image', file);
//     return formData;
//   };

//   const handleCreateBranchCampaign = async (
//     data: VendorCampaignFormData,
//     imageFile: File | null
//   ): Promise<void> => {
//     if (branchId === null) return;

//     const createdCampaign = await onCreateBranchCampaign(branchId, {
//       name: data.name,
//       description: data.description ?? null,
//       targetSegment: data.targetSegment ?? null,
//       startDate: data.startDate,
//       endDate: data.endDate,
//       isActive: data.isActive,
//     });

//     if (imageFile) {
//       await onPostCampaignImage(
//         createdCampaign.campaignId,
//         createImageFormData(imageFile)
//       );
//     }

//     setIsCreateModalOpen(false);
//   };

//   const columns = [
//     {
//       key: 'campaignId',
//       label: 'ID',
//       style: { width: '70px' },
//     },
//     {
//       key: 'name',
//       label: 'Tên chiến dịch',
//       render: (value: unknown): React.ReactNode => (
//         <Box className="font-semibold text-[var(--color-table-text-primary)]">
//           {typeof value === 'string' ? value : String(value)}
//         </Box>
//       ),
//     },
//     {
//       key: 'startDate',
//       label: 'Thời gian diễn ra',
//       render: (_: unknown, row: VendorCampaign): React.ReactNode => (
//         <Box className="text-sm text-[var(--color-table-text-secondary)]">
//           <div>Từ: {formatVNDatetime(row.startDate)}</div>
//           <div>Đến: {formatVNDatetime(row.endDate)}</div>
//         </Box>
//       ),
//     },
//     {
//       key: 'targetSegment',
//       label: 'Phân khúc',
//       render: (value: unknown): React.ReactNode => (
//         <Box className="text-table-text-primary">
//           {typeof value === 'string' && value.trim().length > 0
//             ? value
//             : 'Tất cả'}
//         </Box>
//       ),
//     },
//     {
//       key: 'isActive',
//       label: 'Hoạt động',
//       style: { width: '150px' },
//       render: (value: unknown): React.ReactNode => (
//         <StatusBadge
//           label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
//           type={value === true ? 'success' : 'error'}
//         />
//       ),
//     },
//   ];

//   return (
//     <>
//       <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
//         <DialogTitle>Quản lý chiến dịch - {branch?.name ?? '-'}</DialogTitle>

//         <DialogContent dividers>
//           <Box className="mb-4 flex flex-wrap items-center justify-end gap-2">
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
//             >
//               <AddIcon fontSize="small" />
//               Tạo chiến dịch
//             </button>
//             <button
//               onClick={() => {
//                 setSelectedBranchId(branchId);
//                 setIsJoinableModalOpen(true);
//               }}
//               className="flex items-center gap-2 rounded-lg border border-[var(--color-primary-600)] bg-white px-4 py-2 font-semibold text-[var(--color-primary-700)] transition-colors hover:bg-[var(--color-primary-50)]"
//             >
//               <GroupAddIcon fontSize="small" />
//               Tham gia chiến dịch hệ thống
//             </button>
//           </Box>

//           <Table
//             columns={columns}
//             data={campaigns}
//             rowKey="campaignId"
//             loading={status === 'pending'}
//             emptyMessage="Chi nhánh chưa có chiến dịch nào"
//             maxHeight="none"
//           />

//           <Pagination
//             currentPage={page}
//             totalPages={totalPages}
//             totalCount={totalCount ?? 0}
//             pageSize={pageSize}
//             hasPrevious={page > 1}
//             hasNext={page < totalPages}
//             onPageChange={setPage}
//             onPageSizeChange={(newPageSize) => {
//               setPageSize(newPageSize);
//               setPage(1);
//             }}
//           />
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={onClose} color="inherit">
//             Đóng
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <VendorCampaignFormModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onSubmit={handleCreateBranchCampaign}
//         campaign={null}
//         hideApplyScope
//         status={status}
//       />

//       <JoinableSystemCampaignModal
//         isOpen={isJoinableModalOpen}
//         onClose={() => setIsJoinableModalOpen(false)}
//         branchId={selectedBranchId}
//         mode="join"
//         joinedCampaignIds={campaigns.map((campaign) => campaign.campaignId)}
//       />
//     </>
//   );
// }
