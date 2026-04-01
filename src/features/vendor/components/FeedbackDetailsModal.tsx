import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import useFeedback from '@features/vendor/hooks/useFeedback';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectSelectedFeedback, selectFeedbackStatus } from '@slices/feedback';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';

interface FeedbackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackId: number | null;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('vi-VN');
};

export default function FeedbackDetailsModal({
  isOpen,
  onClose,
  feedbackId,
}: FeedbackDetailsModalProps): JSX.Element | null {
  const feedback = useAppSelector(selectSelectedFeedback);
  const status = useAppSelector(selectFeedbackStatus);

  const { onGetFeedbackDetails, onCreateReply, onUpdateReply, onDeleteReply } =
    useFeedback();

  const [draft, setDraft] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch details khi modal mở
  useEffect(() => {
    if (!isOpen || !feedbackId) return;
    void onGetFeedbackDetails(feedbackId);
  }, [isOpen, feedbackId, onGetFeedbackDetails]);

  // Sync draft với reply hiện tại
  useEffect(() => {
    if (!isOpen) {
      setDraft('');
      setIsEditing(false);
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      setSelectedImage(null);
      return;
    }
    const replyContent =
      typeof feedback?.vendorReply?.content === 'string'
        ? feedback.vendorReply.content
        : '';
    setDraft(replyContent);
  }, [feedback, isOpen]);

  if (!isOpen) return null;

  const isLoading = status === 'pending' && !feedback;

  const replyContent =
    typeof feedback?.vendorReply?.content === 'string'
      ? feedback.vendorReply.content
      : '';
  const repliedAt =
    feedback?.vendorReply?.updatedAt ?? feedback?.vendorReply?.createdAt;

  const isReadOnly = Boolean(replyContent) && !isEditing;

  const displayName =
    feedback?.user?.name?.trim() !== ''
      ? (feedback?.user?.name ?? 'Ẩn danh')
      : 'Ẩn danh';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase();
  const rating = Math.max(0, Math.min(5, Math.round(feedback?.rating ?? 0)));

  const handleSubmitReply = async (): Promise<void> => {
    if (!feedback || !draft.trim()) return;
    setIsProcessing(true);
    try {
      if (replyContent) {
        await onUpdateReply({
          feedbackId: feedback.id,
          data: { content: draft.trim() },
        });
      } else {
        await onCreateReply({
          feedbackId: feedback.id,
          data: { content: draft.trim() },
        });
      }
      setIsEditing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteReply = async (): Promise<void> => {
    if (!feedback) return;
    setIsProcessing(true);
    try {
      await onDeleteReply(feedback.id);
      setShowDeleteConfirm(false);
      setIsEditing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEdit = (): void => {
    setDraft(replyContent);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <div className="min-w-0">
            <p className="text-primary-700 mb-1 text-xs font-semibold tracking-wide uppercase">
              Chi tiết đánh giá
            </p>
            <h2 className="text-table-text-primary text-lg leading-tight font-bold">
              {feedback ? `#${feedback.id.toString()}` : '—'}
            </h2>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <CircularProgress size={32} />
            </div>
          ) : !feedback ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Không tìm thấy thông tin đánh giá.
            </div>
          ) : (
            <div className="space-y-4">
              {/* User info + rating */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {feedback.user?.avatar ? (
                      <img
                        src={feedback.user.avatar}
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary-100 text-primary-700 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                        {avatarInitial || 'A'}
                      </div>
                    )}
                    <div>
                      <div className="text-table-text-primary text-sm font-semibold">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-500">Khách hàng</div>
                    </div>
                  </div>
                  <div className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                    {formatDateTime(feedback.createdAt)}
                  </div>
                </div>

                {/* Stars */}
                <div
                  className="mb-3 flex items-center gap-1"
                  aria-label={`Đánh giá ${rating.toString()} sao`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon
                      key={i}
                      sx={{ fontSize: 20 }}
                      className={
                        i < rating ? 'text-amber-500' : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-amber-600">
                    {rating}/5
                  </span>
                </div>

                {/* Dish info */}
                {feedback.dish != null && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">
                    <span className="font-semibold">Món:</span>
                    <span>{String(feedback.dish.name)}</span>
                  </div>
                )}

                {/* Comment */}
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500">
                    Nhận xét của {displayName}
                  </p>
                  <p className="text-table-text-primary text-sm whitespace-pre-wrap">
                    {feedback.comment || '-'}
                  </p>
                </div>

                {/* Tags */}
                {feedback.tags && feedback.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {feedback.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Images */}
                {feedback.images && feedback.images.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <ImageIcon sx={{ fontSize: 14 }} />
                      Hình ảnh ({feedback.images.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feedback.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-transform hover:scale-105"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Ảnh ${(idx + 1).toString()}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Votes */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>👍 {feedback.upVotes} hữu ích</span>
                  <span>👎 {feedback.downVotes} không hữu ích</span>
                </div>
              </div>

              {/* Reply section */}
              <div className="bg-primary-50 border-primary-100 rounded-xl border p-4">
                <label
                  htmlFor="feedback-detail-reply"
                  className="text-primary-700 mb-2 block text-xs font-semibold"
                >
                  Phản hồi của chi nhánh
                </label>
                <textarea
                  id="feedback-detail-reply"
                  value={draft}
                  readOnly={isReadOnly}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập nội dung phản hồi..."
                  className={`border-primary-200 h-24 w-full resize-none rounded-md border p-2 text-sm transition-colors outline-none ${
                    isReadOnly
                      ? 'cursor-not-allowed bg-gray-100 text-gray-600'
                      : 'focus:border-primary-500 bg-white'
                  }`}
                />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">
                    Đã phản hồi lúc: {formatDateTime(repliedAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {replyContent && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                        Xóa phản hồi
                      </button>
                    )}

                    {!replyContent && (
                      <button
                        onClick={() => void handleSubmitReply()}
                        disabled={isProcessing || draft.trim() === ''}
                        className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <CircularProgress size={14} sx={{ color: '#fff' }} />
                        ) : (
                          <SendIcon sx={{ fontSize: 16 }} />
                        )}
                        Gửi phản hồi
                      </button>
                    )}

                    {replyContent && !isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        disabled={isProcessing}
                        className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                        Chỉnh sửa
                      </button>
                    )}

                    {replyContent && isEditing && (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => void handleSubmitReply()}
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
          )}
        </div>

        {/* Delete confirm dialog */}
        <DeleteConfirmationDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteReply}
          title="Xác nhận xóa phản hồi"
          confirmationMessage={
            <>Bạn có chắc chắn muốn xóa phản hồi cho đánh giá này không?</>
          }
        />
      </div>

      {/* Lightbox for images */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Ảnh phóng to"
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/40"
            onClick={() => setSelectedImage(null)}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}
