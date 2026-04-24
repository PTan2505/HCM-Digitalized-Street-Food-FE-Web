import type { Step } from 'react-joyride';

interface FeedbackTagManagementTourConfig {
  hasRows: boolean;
}

const FEEDBACK_TAG_TOUR_ID = 'admin-feedback-tag';

export const getFeedbackTagManagementTourSteps = ({
  hasRows,
}: FeedbackTagManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="feedback-tag-page-header"]',
      title: 'Tổng quan quản lý tag phản hồi',
      content: 'Đây là nơi quản lý các tag phản hồi từ người dùng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="feedback-tag-create-button"]',
      title: 'Thêm tag phản hồi',
      content: 'Nhấn để tạo một tag phản hồi mới.',
      placement: 'left',
    },
    {
      target: '[data-tour="feedback-tag-table-wrapper"]',
      title: 'Danh sách tag phản hồi',
      content: 'Bảng hiển thị tên và mô tả của từng tag phản hồi.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="feedback-tag-table-wrapper"]',
        title: 'Chưa có tag phản hồi',
        content: 'Hiện chưa có tag phản hồi nào.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${FEEDBACK_TAG_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng tag phản hồi',
      content: 'Mỗi dòng là một tag phản hồi để quản lý nhanh.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${FEEDBACK_TAG_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa tag phản hồi',
      content: 'Dùng nút này để cập nhật tag phản hồi.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${FEEDBACK_TAG_TOUR_ID}:close"], [data-tour-action="${FEEDBACK_TAG_TOUR_ID}:activate"]`,
      title: 'Đóng hoặc kích hoạt tag phản hồi',
      content:
        'Dùng nút này để cập nhật trạng thái hoạt động của tag phản hồi.',
      placement: 'left',
    },
  ];
};
