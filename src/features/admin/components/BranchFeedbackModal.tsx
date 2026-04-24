import AppModalHeader from '@components/AppModalHeader';
import Pagination from '@features/admin/components/Pagination';
import type { VendorBranch } from '@features/admin/types/vendor';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getFeedbacksByBranch,
  selectBranchFeedbacks,
  selectBranchFeedbacksPagination,
  selectFeedbackStatus,
} from '@slices/feedback';
import CommentIcon from '@mui/icons-material/Comment';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  Rating,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

interface BranchFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  branch: VendorBranch | null;
}

const formatDateTime = (dateValue?: string | null): string => {
  if (!dateValue) {
    return '-';
  }

  return new Date(dateValue).toLocaleString('vi-VN', {
    hour12: false,
  });
};

export default function BranchFeedbackModal({
  open,
  onClose,
  branch,
}: BranchFeedbackModalProps): JSX.Element {
  const dispatch = useAppDispatch();
  const feedbacks = useAppSelector(selectBranchFeedbacks);
  const pagination = useAppSelector(selectBranchFeedbacksPagination);
  const status = useAppSelector(selectFeedbackStatus);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadFeedbacks = useCallback(async (): Promise<void> => {
    if (!branch) return;

    await dispatch(
      getFeedbacksByBranch({
        branchId: branch.branchId,
        params: {
          pageNumber: page,
          pageSize,
        },
      })
    ).unwrap();
  }, [branch, dispatch, page, pageSize]);

  useEffect(() => {
    if (!open || !branch) {
      return;
    }

    void loadFeedbacks();
  }, [branch, loadFeedbacks, open]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setPageSize(5);
    }
  }, [open]);

  const totalPages = useMemo(() => {
    if (pagination.totalPages > 0) {
      return pagination.totalPages;
    }
    return Math.max(1, Math.ceil((pagination.totalCount ?? 0) / pageSize));
  }, [pagination.totalCount, pagination.totalPages, pageSize]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <AppModalHeader
        title="Feedback chi nhánh"
        subtitle={branch?.name ?? ''}
        icon={<CommentIcon />}
        iconTone="admin"
        onClose={onClose}
      />

      <DialogContent className="mt-4 bg-slate-50/50">
        <Box className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Typography variant="body2" color="text.secondary">
            Chi nhánh:{' '}
            <span className="font-semibold text-slate-800">
              {branch?.name ?? '-'}
            </span>
          </Typography>
        </Box>

        <Box className="max-h-[48vh] space-y-3 overflow-y-auto pr-1">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <Box
                key={feedback.feedbackId}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <Box className="mb-2 flex items-center justify-between gap-2">
                  <Typography variant="subtitle2" className="font-semibold">
                    {feedback.userName ?? 'Ẩn danh'}
                  </Typography>
                  <Rating
                    value={Number(feedback.rating ?? 0)}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </Box>

                <Typography
                  variant="body2"
                  className="mb-2 whitespace-pre-wrap text-slate-700"
                >
                  {feedback.comment?.trim()
                    ? feedback.comment
                    : 'Không có nội dung'}
                </Typography>

                {feedback.replyContent && (
                  <Box className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 p-2">
                    <Typography
                      variant="caption"
                      className="font-semibold text-emerald-700"
                    >
                      Phản hồi từ quán
                    </Typography>
                    <Typography variant="body2" className="text-emerald-800">
                      {feedback.replyContent}
                    </Typography>
                  </Box>
                )}

                <Box className="flex items-center justify-between gap-2">
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(feedback.createdAt)}
                  </Typography>
                  {feedback.replyContent ? (
                    <Chip
                      label="Đã phản hồi"
                      size="small"
                      className="border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700"
                    />
                  ) : (
                    <Chip
                      label="Chưa phản hồi"
                      size="small"
                      className="border border-amber-200 bg-amber-50 font-semibold text-amber-700"
                    />
                  )}
                </Box>
              </Box>
            ))
          ) : (
            <Box className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
              <Typography variant="body2" color="text.secondary">
                {status === 'pending'
                  ? 'Đang tải feedback...'
                  : 'Chi nhánh chưa có feedback.'}
              </Typography>
            </Box>
          )}
        </Box>

        <Pagination
          currentPage={pagination.currentPage || page}
          totalPages={totalPages}
          totalCount={pagination.totalCount ?? 0}
          pageSize={pagination.pageSize || pageSize}
          hasPrevious={pagination.hasPrevious ?? page > 1}
          hasNext={pagination.hasNext ?? page < totalPages}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </DialogContent>
    </Dialog>
  );
}
