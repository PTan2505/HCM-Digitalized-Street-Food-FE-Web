import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

// Base fields shared across all modes
const baseFields = {
  ownerPhone: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER)
    .refine((value) => validator.isMobilePhone(value, 'vi-VN'), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER,
    }),
  email: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
    .refine((value) => validator.isEmail(value), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
    }),
  branchName: z
    .string()
    .nonempty('Vui lòng nhập tên chi nhánh!')
    .min(3, 'Tên chi nhánh phải có ít nhất 3 ký tự!')
    .max(100, 'Tên chi nhánh không được vượt quá 100 ký tự!'),
  detailAddress: z
    .string()
    .nonempty('Vui lòng nhập địa chỉ cửa hàng!')
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự!'),
  ward: z.string().optional(),
  city: z.string().optional(),
  latitude: z
    .number()
    .nullable()
    .refine((val) => val !== null, {
      message: 'Vui lòng chọn vị trí trên bản đồ!',
    }),
  longitude: z
    .number()
    .nullable()
    .refine((val) => val !== null, {
      message: 'Vui lòng chọn vị trí trên bản đồ!',
    }),
};

// Schema for createVendor mode — requires ownerName
export const CreateVendorSchema = z.object({
  ...baseFields,
  ownerName: z
    .string()
    .nonempty('Vui lòng nhập tên cửa hàng!')
    .min(3, 'Tên cửa hàng phải có ít nhất 3 ký tự!')
    .max(100, 'Tên cửa hàng không được vượt quá 100 ký tự!'),
  dietaryPreferenceIds: z
    .array(z.number())
    .min(1, 'Vui lòng chọn ít nhất một chế độ ăn phù hợp!'),
});

// Schema for addBranch mode
export const AddBranchSchema = z.object({
  ...baseFields,
});

// Schema for editBranch mode
export const EditBranchSchema = z.object({
  ...baseFields,
});

export type CreateVendorFormData = z.infer<typeof CreateVendorSchema>;
export type AddBranchFormData = z.infer<typeof AddBranchSchema>;
export type EditBranchFormData = z.infer<typeof EditBranchSchema>;

// Union type for all form data types
export type BranchFormData =
  | CreateVendorFormData
  | AddBranchFormData
  | EditBranchFormData;

// Schema for VendorRegistrationPage (createVendor + agreeTerms)
export const VendorRegistrationSchema = CreateVendorSchema.extend({
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với điều khoản sử dụng!',
  }),
});

export type VendorRegistrationFormData = z.infer<
  typeof VendorRegistrationSchema
>;
