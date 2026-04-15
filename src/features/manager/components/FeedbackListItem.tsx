import type { BranchFeedbackResponse } from '@features/vendor/types/feedback';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, Typography } from '@mui/material';
import type { JSX } from 'react';

interface FeedbackListItemProps {
  feedback: BranchFeedbackResponse;
  onViewDetails: (feedbackId: number) => void;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('vi-VN');
};

const getDisplayName = (feedback: BranchFeedbackResponse): string => {
  if (feedback.userName && feedback.userName.trim() !== '') {
    return feedback.userName;
  }

  return 'Ẩn danh';
};

export default function FeedbackListItem({
  feedback,
  onViewDetails,
}: FeedbackListItemProps): JSX.Element {
  const displayName = getDisplayName(feedback);
  const avatarInitial = displayName.trim().charAt(0).toUpperCase();
  const rating = Math.max(0, Math.min(5, Math.round(feedback.rating ?? 0)));

  return (
    <Box className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <Box className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <Box className="flex items-center gap-3">
          <Box className="bg-primary-100 text-primary-700 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
            {avatarInitial || 'A'}
          </Box>
          <Box>
            <Typography className="text-table-text-primary text-sm font-semibold">
              {displayName}
            </Typography>
            <Typography className="text-xs text-gray-500">
              {formatDateTime(feedback.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={() => onViewDetails(feedback.feedbackId)}
        >
          Xem chi tiết và phản hồi
        </Button>
      </Box>

      <Box className="mb-2 flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            sx={{ fontSize: 18 }}
            className={index < rating ? 'text-amber-500' : 'text-gray-300'}
          />
        ))}
        <Typography className="ml-1 text-sm font-semibold text-amber-600">
          {rating}/5
        </Typography>
      </Box>

      <Typography className="text-table-text-primary text-sm whitespace-pre-wrap">
        {feedback.comment || '-'}
      </Typography>

      <Box className="mt-2 text-xs text-gray-500">
        Trạng thái phản hồi:{' '}
        {feedback.replyContent ? (
          <span className="font-semibold text-green-700">
            Đã phản hồi ({formatDateTime(feedback.repliedAt)})
          </span>
        ) : (
          <span className="font-semibold text-amber-700">Chưa phản hồi</span>
        )}
      </Box>
    </Box>
  );
}
