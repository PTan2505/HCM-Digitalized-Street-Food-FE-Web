import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import type { BranchFeedbackResponse } from '@features/vendor/types/feedback';
import useFeedback from '@features/vendor/hooks/useFeedback';
import Pagination from '@features/vendor/components/Pagination';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectBranchFeedbacks,
  selectBranchFeedbacksPagination,
  selectFeedbackStatus,
} from '@slices/feedback';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface BranchFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const getDisplayName = (feedback: BranchFeedbackResponse): string => {
  return feedback.userName ?? 'Ẩn danh';
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('vi-VN');
};

export default function BranchFeedbackModal({
  isOpen,
  onClose,
  branch,
}: BranchFeedbackModalProps): JSX.Element | null {
  const feedbacks = useAppSelector(selectBranchFeedbacks);
  const pagination = useAppSelector(selectBranchFeedbacksPagination);
  const status = useAppSelector(selectFeedbackStatus);

  const {
    onGetFeedbacksByBranch,
    onCreateReply,
    onUpdateReply,
    onDeleteReply,
  } = useFeedback();

  const branchId = branch?.branchId;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [draftReplies, setDraftReplies] = useState<Record<number, string>>({});
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [editingIds, setEditingIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] =
    useState<BranchFeedbackResponse | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    if (!branchId) return;

    await onGetFeedbacksByBranch({
      branchId,
      params: {
        pageNumber,
        pageSize,
      },
    });
  }, [branchId, onGetFeedbacksByBranch, pageNumber, pageSize]);

  useEffect(() => {
    if (!isOpen || !branchId) return;

    void fetchFeedbacks();
  }, [isOpen, branchId, fetchFeedbacks]);

  useEffect(() => {
    if (!isOpen) {
      setPageNumber(1);
      setPageSize(10);
      setDraftReplies({});
      setProcessingIds(new Set());
      setEditingIds(new Set());
      setDeleteTarget(null);
      return;
    }

    const nextDrafts = feedbacks.reduce<Record<number, string>>((acc, item) => {
      acc[item.feedbackId] = item.replyContent ?? '';
      return acc;
    }, {});

    setDraftReplies(nextDrafts);
  }, [feedbacks, isOpen]);

  const addProcessing = (feedbackId: number): void => {
    setProcessingIds((prev) => new Set(prev).add(feedbackId));
  };

  const removeProcessing = (feedbackId: number): void => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(feedbackId);
      return next;
    });
  };

  const handleSubmitReply = async (
    feedback: BranchFeedbackResponse
  ): Promise<void> => {
    const content = draftReplies[feedback.feedbackId]?.trim() ?? '';
    if (!content) return;

    addProcessing(feedback.feedbackId);
    try {
      const existingReply = feedback.replyContent ?? '';

      if (existingReply) {
        await onUpdateReply({
          feedbackId: feedback.feedbackId,
          data: { content },
        });
      } else {
        await onCreateReply({
          feedbackId: feedback.feedbackId,
          data: { content },
        });
      }

      // await fetchFeedbacks();
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.delete(feedback.feedbackId);
        return next;
      });
    } finally {
      removeProcessing(feedback.feedbackId);
    }
  };

  const handleStartEdit = (feedbackId: number): void => {
    setEditingIds((prev) => new Set(prev).add(feedbackId));
  };

  const handleCancelEdit = (feedbackId: number, replyContent: string): void => {
    setDraftReplies((prev) => ({
      ...prev,
      [feedbackId]: replyContent,
    }));
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(feedbackId);
      return next;
    });
  };

  const handleDeleteReply = async (feedbackId: number): Promise<void> => {
    addProcessing(feedbackId);
    try {
      await onDeleteReply(feedbackId);
      // await fetchFeedbacks();
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.delete(feedbackId);
        return next;
      });
      setDeleteTarget(null);
    } finally {
      removeProcessing(feedbackId);
    }
  };

  const handleOpenDeleteConfirm = (feedback: BranchFeedbackResponse): void => {
    setDeleteTarget(feedback);
  };

  const handleCloseDeleteConfirm = (): void => {
    setDeleteTarget(null);
  };

  const handlePageChange = (page: number): void => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setPageNumber(1);
  };

  if (!isOpen || !branch) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <div className="min-w-0">
            <p className="text-primary-700 mb-1 text-xs font-semibold tracking-wide uppercase">
              Chi nhánh đang xem
            </p>
            <h2 className="text-table-text-primary truncate text-lg leading-tight font-bold">
              {branch.name}
            </h2>
            <div className="mt-1 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600">
              Mã chi nhánh: #{branch.branchId}
            </div>
          </div>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'white',
              border: '1px solid #f3f4f6',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {status === 'pending' && feedbacks.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <CircularProgress size={32} />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Chi nhánh này chưa có phản hồi nào.
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => {
                const replyContent = feedback.replyContent ?? '';
                const isProcessing = processingIds.has(feedback.feedbackId);
                const draft = draftReplies[feedback.feedbackId] ?? '';
                const isEditing = editingIds.has(feedback.feedbackId);
                const isReadOnly = Boolean(replyContent) && !isEditing;
                const displayName = getDisplayName(feedback);
                const avatarInitial = displayName
                  .trim()
                  .charAt(0)
                  .toUpperCase();
                const rating = Math.max(
                  0,
                  Math.min(5, Math.round(feedback.rating ?? 0))
                );

                return (
                  <div
                    key={feedback.feedbackId}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-100 text-primary-700 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                          {avatarInitial || 'A'}
                        </div>
                        <div>
                          <div className="text-table-text-primary text-sm font-semibold">
                            {displayName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Khách hàng
                          </div>
                        </div>
                      </div>
                      <div className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                        {formatDateTime(feedback.createdAt)}
                      </div>
                    </div>

                    <div
                      className="mb-3 flex items-center gap-1"
                      aria-label={`Đánh giá ${rating} sao`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <StarIcon
                          key={index}
                          sx={{ fontSize: 18 }}
                          className={
                            index < rating ? 'text-amber-500' : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>

                    <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500">
                        Nhận xét của {displayName}
                      </p>
                      <p className="text-table-text-primary text-sm whitespace-pre-wrap">
                        {feedback.comment || '-'}
                      </p>
                    </div>

                    <div className="bg-primary-50 border-primary-100 rounded-lg border p-3">
                      <label
                        htmlFor={`reply-${feedback.feedbackId}`}
                        className="text-primary-700 mb-2 block text-xs font-semibold"
                      >
                        Phản hồi của chi nhánh
                      </label>
                      <textarea
                        id={`reply-${feedback.feedbackId}`}
                        value={draft}
                        readOnly={isReadOnly}
                        onChange={(e) =>
                          setDraftReplies((prev) => ({
                            ...prev,
                            [feedback.feedbackId]: e.target.value,
                          }))
                        }
                        placeholder="Nhập nội dung phản hồi..."
                        className={`border-primary-200 h-24 w-full resize-none rounded-md border p-2 text-sm transition-colors outline-none ${
                          isReadOnly
                            ? 'cursor-not-allowed bg-gray-100 text-gray-600'
                            : 'focus:border-primary-500 bg-white'
                        }`}
                      />

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">
                          Đã phản hồi lúc: {formatDateTime(feedback.repliedAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          {replyContent && (
                            <button
                              onClick={() => handleOpenDeleteConfirm(feedback)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                              Xóa phản hồi
                            </button>
                          )}

                          {!replyContent && (
                            <button
                              onClick={() => void handleSubmitReply(feedback)}
                              disabled={isProcessing || draft.trim() === ''}
                              className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <CircularProgress
                                  size={14}
                                  sx={{ color: '#fff' }}
                                />
                              ) : (
                                <SendIcon sx={{ fontSize: 16 }} />
                              )}
                              Gửi phản hồi
                            </button>
                          )}

                          {replyContent && !isEditing && (
                            <button
                              onClick={() =>
                                handleStartEdit(feedback.feedbackId)
                              }
                              disabled={isProcessing}
                              className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                              Chỉnh sửa phản hồi
                            </button>
                          )}

                          {replyContent && isEditing && (
                            <>
                              <button
                                onClick={() =>
                                  handleCancelEdit(
                                    feedback.feedbackId,
                                    replyContent
                                  )
                                }
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => void handleSubmitReply(feedback)}
                                disabled={isProcessing || draft.trim() === ''}
                                className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <CircularProgress
                                    size={14}
                                    sx={{ color: '#fff' }}
                                  />
                                ) : (
                                  <EditIcon sx={{ fontSize: 16 }} />
                                )}
                                Lưu cập nhật
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3">
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
        </div>

        <Dialog
          open={deleteTarget !== null}
          onClose={handleCloseDeleteConfirm}
          aria-labelledby="delete-feedback-reply-dialog-title"
          aria-describedby="delete-feedback-reply-dialog-description"
        >
          <DialogTitle id="delete-feedback-reply-dialog-title">
            Xác nhận xóa phản hồi
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-feedback-reply-dialog-description">
              Bạn có chắc chắn muốn xóa phản hồi cho đánh giá này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirm} color="primary">
              Hủy
            </Button>
            <Button
              onClick={() =>
                deleteTarget && void handleDeleteReply(deleteTarget.feedbackId)
              }
              color="error"
              variant="contained"
              autoFocus
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
