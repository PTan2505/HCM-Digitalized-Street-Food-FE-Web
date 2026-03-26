import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import FeedbackListItem from '@features/manager/components/FeedbackListItem';
import FeedbackDetailsModal from '@features/vendor/components/FeedbackDetailsModal';
import Pagination from '@features/vendor/components/Pagination';
import useFeedback from '@features/vendor/hooks/useFeedback';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectBranchFeedbacks,
  selectBranchFeedbacksPagination,
  selectFeedbackStatus,
} from '@slices/feedback';
import RateReviewIcon from '@mui/icons-material/RateReview';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

type ReplyStatusFilter = 'all' | 'replied' | 'notReplied';

export default function FeedbackManagementPage(): JSX.Element {
  const { onGetManagerMyBranch } = useBranchManagement();
  const { onGetFeedbacksByBranch } = useFeedback();

  const feedbacks = useAppSelector(selectBranchFeedbacks);
  const pagination = useAppSelector(selectBranchFeedbacksPagination);
  const status = useAppSelector(selectFeedbackStatus);

  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchName, setBranchName] = useState('');
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [replyStatusFilter, setReplyStatusFilter] =
    useState<ReplyStatusFilter>('all');
  const [feedbackModalId, setFeedbackModalId] = useState<number | null>(null);

  useEffect(() => {
    const loadManagerBranch = async (): Promise<void> => {
      setIsLoadingBranch(true);
      setLoadingError(null);

      try {
        const branch = await onGetManagerMyBranch();
        setBranchId(branch.branchId);
        setBranchName(branch.name);
      } catch {
        setLoadingError('Không thể tải thông tin chi nhánh quản lý.');
      } finally {
        setIsLoadingBranch(false);
      }
    };

    void loadManagerBranch();
  }, [onGetManagerMyBranch]);

  useEffect(() => {
    const loadFeedbacks = async (): Promise<void> => {
      if (!branchId) {
        return;
      }

      try {
        await onGetFeedbacksByBranch({
          branchId,
          params: {
            pageNumber,
            pageSize,
          },
        });
      } catch {
        // Toast is handled by axios interceptor.
      }
    };

    void loadFeedbacks();
  }, [branchId, onGetFeedbacksByBranch, pageNumber, pageSize]);

  const feedbackSummary = useMemo(() => {
    if (feedbacks.length === 0) {
      return {
        averageRating: 0,
      };
    }

    const totalRating = feedbacks.reduce((sum, item) => {
      return sum + (item.rating ?? 0);
    }, 0);

    return {
      averageRating: totalRating / feedbacks.length,
    };
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (replyStatusFilter === 'all') {
      return feedbacks;
    }

    if (replyStatusFilter === 'replied') {
      return feedbacks.filter((item) => Boolean(item.replyContent));
    }

    return feedbacks.filter((item) => !item.replyContent);
  }, [feedbacks, replyStatusFilter]);

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Box>
          <Typography className="text-sm font-semibold text-gray-500">
            Chi nhánh đang quản lý
          </Typography>
          <Typography className="text-table-text-primary text-lg font-bold">
            {branchName || '-'}
          </Typography>
        </Box>

        <Box className="border-primary-200 bg-primary-50 text-primary-700 rounded-full border px-3 py-1.5 text-sm font-semibold">
          Trung bình: {feedbackSummary.averageRating.toFixed(1)}/5.0 sao
        </Box>
      </Box>

      {loadingError && <Alert severity="error">{loadingError}</Alert>}

      {isLoadingBranch ? (
        <Box className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <CircularProgress size={32} />
        </Box>
      ) : !branchId ? (
        <Alert severity="warning">
          Không tìm thấy chi nhánh để tải phản hồi.
        </Alert>
      ) : (
        <>
          <Box className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <Box className="flex items-center gap-2">
              <RateReviewIcon className="text-primary-600" />
              <Typography className="text-table-text-primary text-base font-semibold">
                Danh sách phản hồi chi nhánh
              </Typography>
            </Box>

            <Box className="flex flex-wrap items-center gap-2">
              <Button
                size="small"
                variant={replyStatusFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setReplyStatusFilter('all')}
                sx={{
                  ...(replyStatusFilter === 'all'
                    ? {
                        bgcolor: '#475569',
                        color: '#ffffff',
                        borderColor: '#475569',
                        '&:hover': {
                          bgcolor: '#334155',
                          borderColor: '#334155',
                        },
                      }
                    : {
                        color: '#475569',
                        borderColor: '#475569',
                        '&:hover': {
                          borderColor: '#334155',
                          bgcolor: '#f8fafc',
                        },
                      }),
                }}
              >
                Tất cả
              </Button>
              <Button
                size="small"
                variant={
                  replyStatusFilter === 'replied' ? 'contained' : 'outlined'
                }
                onClick={() => setReplyStatusFilter('replied')}
                sx={{
                  ...(replyStatusFilter === 'replied'
                    ? {
                        bgcolor: '#15803d',
                        color: '#ffffff',
                        borderColor: '#15803d',
                        '&:hover': {
                          bgcolor: '#166534',
                          borderColor: '#166534',
                        },
                      }
                    : {
                        color: '#15803d',
                        borderColor: '#15803d',
                        '&:hover': {
                          borderColor: '#166534',
                          bgcolor: '#f0fdf4',
                        },
                      }),
                }}
              >
                Đã phản hồi
              </Button>
              <Button
                size="small"
                variant={
                  replyStatusFilter === 'notReplied' ? 'contained' : 'outlined'
                }
                onClick={() => setReplyStatusFilter('notReplied')}
                sx={{
                  ...(replyStatusFilter === 'notReplied'
                    ? {
                        bgcolor: '#b45309',
                        color: '#ffffff',
                        borderColor: '#b45309',
                        '&:hover': {
                          bgcolor: '#92400e',
                          borderColor: '#92400e',
                        },
                      }
                    : {
                        color: '#b45309',
                        borderColor: '#b45309',
                        '&:hover': {
                          borderColor: '#92400e',
                          bgcolor: '#fffbeb',
                        },
                      }),
                }}
              >
                Chưa phản hồi
              </Button>
            </Box>

            {status === 'pending' && feedbacks.length === 0 ? (
              <Box className="flex h-40 items-center justify-center">
                <CircularProgress size={30} />
              </Box>
            ) : filteredFeedbacks.length === 0 ? (
              <Box className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                {feedbacks.length === 0
                  ? 'Chi nhánh chưa có phản hồi nào.'
                  : 'Không có phản hồi phù hợp với bộ lọc đang chọn.'}
              </Box>
            ) : (
              <Box className="space-y-3">
                {filteredFeedbacks.map((feedback) => (
                  <FeedbackListItem
                    key={feedback.feedbackId}
                    feedback={feedback}
                    onViewDetails={setFeedbackModalId}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            onPageChange={setPageNumber}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPageNumber(1);
            }}
          />
        </>
      )}

      <FeedbackDetailsModal
        isOpen={feedbackModalId !== null}
        onClose={() => setFeedbackModalId(null)}
        feedbackId={feedbackModalId}
      />
    </Box>
  );
}
