import type { Step } from 'react-joyride';

interface FeedbackManagementTourConfig {
  hasRows: boolean;
}

export const getManagerFeedbackManagementTourSteps = ({
  hasRows,
}: FeedbackManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="manager-feedback-header"]',
      title: 'Tổng quan phản hồi',
      content:
        'Đây là màn hình theo dõi phản hồi của khách hàng cho chi nhánh bạn đang quản lý.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="manager-feedback-summary"]',
      title: 'Thông tin chi nhánh và điểm trung bình',
      content:
        'Khu vực này hiển thị chi nhánh hiện tại cùng điểm đánh giá trung bình để bạn nắm nhanh chất lượng dịch vụ.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-feedback-filter"]',
      title: 'Bộ lọc trạng thái phản hồi',
      content:
        'Bạn có thể lọc theo tất cả, đã phản hồi hoặc chưa phản hồi để xử lý hiệu quả hơn.',
      placement: 'bottom-start',
    },
    {
      target: '[data-tour="manager-feedback-list"]',
      title: 'Danh sách phản hồi',
      content:
        'Mỗi thẻ phản hồi cho phép bạn xem chi tiết để đánh giá nội dung và lịch sử trả lời.',
      placement: 'top',
    },
    {
      target: '[data-tour="manager-feedback-pagination"]',
      title: 'Phân trang phản hồi',
      content: 'Dùng phân trang để duyệt toàn bộ phản hồi khi dữ liệu nhiều.',
      placement: 'top',
    },
  ];

  if (hasRows) {
    return baseSteps;
  }

  return [
    ...baseSteps,
    {
      target: '[data-tour="manager-feedback-list"]',
      title: 'Chưa có phản hồi',
      content:
        'Hiện chưa có phản hồi phù hợp để hiển thị. Khi có dữ liệu mới, bạn có thể mở lại hướng dẫn.',
      placement: 'top',
    },
  ];
};
