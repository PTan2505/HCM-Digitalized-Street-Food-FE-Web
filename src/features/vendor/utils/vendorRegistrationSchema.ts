import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const VendorRegistrationSchema = z.object({
  // Thông tin cửa hàng
  ownerName: z
    .string()
    .nonempty('Vui lòng nhập tên cửa hàng!')
    .min(3, 'Tên cửa hàng phải có ít nhất 3 ký tự!')
    .max(100, 'Tên cửa hàng không được vượt quá 100 ký tự!'),
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

  // Thông tin chi nhánh
  branchName: z.string().optional(), // Optional - có thể để trống
  ward: z
    .string()
    .nonempty('Vui lòng nhập phường/xã!')
    .min(3, 'Phường/xã phải có ít nhất 3 ký tự!'),
  detailAddress: z
    .string()
    .nonempty('Vui lòng nhập địa chỉ cửa hàng!')
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự!'),
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

  // Điều khoản (chỉ dùng khi đăng ký mới)
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với điều khoản sử dụng!',
  }),
});

// Schema cho upload/resubmit license (chỉ cần ảnh)
export const LicenseSubmitSchema = z.object({
  licenseImages: z
    .array(z.instanceof(File))
    .min(1, 'Vui lòng chọn ít nhất một ảnh giấy phép!'),
});

export type VendorRegistrationFormData = z.infer<
  typeof VendorRegistrationSchema
>;
export type LicenseSubmitFormData = z.infer<typeof LicenseSubmitSchema>;
