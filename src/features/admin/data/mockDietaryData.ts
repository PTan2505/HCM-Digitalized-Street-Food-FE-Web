export interface DietaryDefinition {
  dietaryId: number;
  name: string;
  description: string;
}

export const MOCK_DIETARY: DietaryDefinition[] = [
  {
    dietaryId: 1,
    name: 'Ăn chay',
    description: 'Không sử dụng thịt, cá, hải sản và các sản phẩm từ động vật',
  },
  {
    dietaryId: 2,
    name: 'Không gluten',
    description: 'Không chứa gluten, phù hợp cho người dị ứng gluten',
  },
  {
    dietaryId: 3,
    name: 'Halal',
    description: 'Đạt tiêu chuẩn Halal theo giáo luật Hồi giáo',
  },
  {
    dietaryId: 4,
    name: 'Ăn kiêng đường',
    description: 'Ít đường, phù hợp cho người tiểu đường',
  },
  {
    dietaryId: 5,
    name: 'Ăn thuần chay',
    description: 'Hoàn toàn không sử dụng sản phẩm từ động vật',
  },
];
