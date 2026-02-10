// Mock data chung cho Badge và User Badge Management
// Dữ liệu mẫu để test chức năng

export interface BadgeDefinition {
  badgeId: number;
  badgeName: string;
  pointToGet: number;
  iconUrl: string;
  description: string;
}

export interface UserBadgeData {
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  badges: {
    badgeId: number;
    badgeName: string;
    iconUrl: string;
    earnedDate: string;
  }[];
  totalPoints: number;
}

// Danh sách badges có sẵn trong hệ thống
export const MOCK_BADGES: BadgeDefinition[] = [
  {
    badgeId: 1,
    badgeName: 'Cũ đêm',
    pointToGet: 1,
    iconUrl:
      'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Fpaomedia%2Fsmall-n-flat%2F1024%2Fsign-check-icon.png',
    description: 'Đi ăn vào lúc 12h đêm',
  },
  {
    badgeId: 2,
    badgeName: 'Thực khách thân thiết',
    pointToGet: 10,
    iconUrl: 'https://i.pravatar.cc/150?img=10',
    description: 'Đã đặt hàng hơn 10 lần',
  },
  {
    badgeId: 3,
    badgeName: 'Người khám phá',
    pointToGet: 5,
    iconUrl: 'https://i.pravatar.cc/150?img=11',
    description: 'Đã thử món ăn từ 5 quán khác nhau',
  },
  {
    badgeId: 4,
    badgeName: 'Đầu bếp nhí',
    pointToGet: 15,
    iconUrl: 'https://i.pravatar.cc/150?img=12',
    description: 'Đã đánh giá hơn 10 món ăn',
  },
];

// Danh sách users và badges của họ
export const MOCK_USER_BADGES: UserBadgeData[] = [
  {
    userId: 1,
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    badges: [
      {
        badgeId: 1,
        badgeName: 'Cũ đêm',
        iconUrl:
          'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Fpaomedia%2Fsmall-n-flat%2F1024%2Fsign-check-icon.png',
        earnedDate: '2026-02-01',
      },
      {
        badgeId: 2,
        badgeName: 'Thực khách thân thiết',
        iconUrl: 'https://i.pravatar.cc/150?img=10',
        earnedDate: '2026-01-15',
      },
    ],
    totalPoints: 25,
  },
  {
    userId: 2,
    userName: 'Trần Thị B',
    userEmail: 'tranthib@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    badges: [
      {
        badgeId: 3,
        badgeName: 'Người khám phá',
        iconUrl: 'https://i.pravatar.cc/150?img=11',
        earnedDate: '2026-01-20',
      },
    ],
    totalPoints: 12,
  },
  {
    userId: 3,
    userName: 'Lê Văn C',
    userEmail: 'levanc@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    badges: [],
    totalPoints: 3,
  },
  {
    userId: 4,
    userName: 'Phạm Thị D',
    userEmail: 'phamthid@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    badges: [
      {
        badgeId: 1,
        badgeName: 'Cũ đêm',
        iconUrl:
          'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Fpaomedia%2Fsmall-n-flat%2F1024%2Fsign-check-icon.png',
        earnedDate: '2026-02-05',
      },
      {
        badgeId: 3,
        badgeName: 'Người khám phá',
        iconUrl: 'https://i.pravatar.cc/150?img=11',
        earnedDate: '2026-01-28',
      },
      {
        badgeId: 4,
        badgeName: 'Đầu bếp nhí',
        iconUrl: 'https://i.pravatar.cc/150?img=12',
        earnedDate: '2026-02-08',
      },
    ],
    totalPoints: 42,
  },
];
