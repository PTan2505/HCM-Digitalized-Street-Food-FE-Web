import type { Step } from 'react-joyride';

interface QuestManagementTourConfig {
  hasRows: boolean;
}

const ADMIN_QUEST_TOUR_ID = 'admin-quest';

export const getQuestManagementTourSteps = ({
  hasRows,
}: QuestManagementTourConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="admin-quest-page-header"]',
      title: 'Tổng quan quản lý nhiệm vụ',
      content:
        'Tạo và quản lý các quest cùng điều kiện phần thưởng cho người dùng.',
      placement: 'bottom-start',
      skipBeacon: true,
    },
    {
      target: '[data-tour="admin-quest-create-button"]',
      title: 'Tạo nhiệm vụ',
      content: 'Nhấn để thêm quest mới cho hệ thống.',
      placement: 'left',
    },
    {
      target: '[data-tour="admin-quest-table-wrapper"]',
      title: 'Danh sách nhiệm vụ',
      content:
        'Bảng thể hiện tiêu đề, mô tả, trạng thái và số người đang tham gia quest.',
      placement: 'top',
    },
  ];

  if (!hasRows) {
    return [
      ...baseSteps,
      {
        target: '[data-tour="admin-quest-table-wrapper"]',
        title: 'Chưa có nhiệm vụ',
        content: 'Hiện chưa có quest nào. Hãy tạo quest đầu tiên.',
        placement: 'top',
      },
    ];
  }

  return [
    ...baseSteps,
    {
      target: `[data-tour-table="${ADMIN_QUEST_TOUR_ID}"] tbody tr[data-tour-row-index="0"]`,
      title: 'Một dòng nhiệm vụ',
      content: 'Mỗi dòng là một quest với thông tin tổng quan.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: `[data-tour-action="${ADMIN_QUEST_TOUR_ID}:detail"]`,
      title: 'Xem chi tiết nhiệm vụ',
      content: 'Mở chi tiết để xem đầy đủ task và điều kiện hoàn thành.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${ADMIN_QUEST_TOUR_ID}:participants"]`,
      title: 'Xem tiến độ người tham gia',
      content:
        'Mở danh sách user đang tham gia quest và theo dõi tiến độ task.',
      placement: 'left',
    },
    {
      target: `[data-tour-action="${ADMIN_QUEST_TOUR_ID}:edit"]`,
      title: 'Chỉnh sửa nhiệm vụ',
      content: 'Cập nhật nội dung và cấu hình quest khi cần.',
      placement: 'left',
    },
  ];
};
