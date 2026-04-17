import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import FeedbackListItem from '@features/manager/components/FeedbackListItem';
import FeedbackDetailsModal from '@features/vendor/components/FeedbackDetailsModal';
import Pagination from '@features/vendor/components/Pagination';
import useFeedback from '@features/vendor/hooks/useFeedback';
import { getManagerFeedbackManagementTourSteps } from '@features/manager/utils/feedbackManagementTourSteps';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectBranchFeedbacks,
  selectBranchFeedbacksPagination,
  selectFeedbackStatus,
} from '@slices/feedback';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StarIcon from '@mui/icons-material/Star';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';

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
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const filledStars = Math.max(
    0,
    Math.min(5, Math.round(feedbackSummary.averageRating))
  );

  const startFeedbackTour = (): void => {
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
    return getManagerFeedbackManagementTourSteps({
      hasRows: filteredFeedbacks.length > 0,
    });
  }, [filteredFeedbacks.length]);

  return (
    <Box className="space-y-4">
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

      <div data-tour="manager-feedback-header">
        <div className="mb-1 flex items-start gap-2">
          <h1 className="text-table-text-primary text-3xl font-bold">
            Quản lý phản hồi chi nhánh
          </h1>
          <button
            type="button"
            onClick={startFeedbackTour}
            aria-label="Mở hướng dẫn quản lý phản hồi"
            title="Hướng dẫn"
            className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
          >
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <p className="text-table-text-secondary text-sm">
          Quản lý danh sách phản hồi của {branchName || 'chi nhánh'} và theo dõi
          trạng thái đã phản hồi / chưa phản hồi
        </p>
      </div>

      <Box
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4"
        data-tour="manager-feedback-summary"
      >
        <Box>
          <Typography className="text-sm font-semibold text-gray-500">
            Chi nhánh đang quản lý
          </Typography>
          <Typography className="text-table-text-primary text-lg font-bold">
            {branchName || '-'}
          </Typography>
        </Box>

        <Box className="flex items-center gap-1.5">
          <Typography className="text-sm font-semibold text-gray-600">
            Trung bình:
          </Typography>
          <span className="inline-flex items-center">
            {Array.from({ length: 5 }, (_, index) => (
              <StarIcon
                key={`feedback-rating-star-${index}`}
                sx={{
                  fontSize: 18,
                  color: index < filledStars ? '#f59e0b' : '#d1d5db',
                }}
              />
            ))}
          </span>
          <Typography className="text-sm font-semibold text-gray-700">
            {feedbackSummary.averageRating.toFixed(1)}/5.0
          </Typography>
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

            <Box
              className="flex flex-wrap items-center gap-2"
              data-tour="manager-feedback-filter"
            >
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
              <Box
                className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
                data-tour="manager-feedback-list"
              >
                {feedbacks.length === 0
                  ? 'Chi nhánh chưa có phản hồi nào.'
                  : 'Không có phản hồi phù hợp với bộ lọc đang chọn.'}
              </Box>
            ) : (
              <Box className="space-y-3" data-tour="manager-feedback-list">
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

          <div data-tour="manager-feedback-pagination">
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
          </div>
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
