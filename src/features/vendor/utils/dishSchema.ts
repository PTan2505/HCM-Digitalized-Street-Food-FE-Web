import * as z from 'zod';

export const DishSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên món ăn'),
  price: z
    .number({ message: 'Vui lòng nhập giá món ăn hợp lệ' })
    .min(1000, 'Giá món ăn tối thiểu là 1,000đ'),
  description: z.string().optional(),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
  tasteIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất một hương vị'),
  // dietaryIds: z
  //   .array(z.number())
  //   .min(1, 'Vui lòng chọn ít nhất một chế độ ăn'),
  isActive: z.boolean(),
});

export type DishFormData = z.infer<typeof DishSchema>;
