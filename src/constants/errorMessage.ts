export const API_ERROR_MESSAGES: Record<string, string> = {
  ERR_001_VALIDATE_ERROR: '',
  ERR_002_PERMISSION_DENIED: 'Bạn không có quyền truy cập vào tài nguyên này!',
  ERR_003_AUTHENTICATION_FAILED: 'Số điện thoại hoặc mật khẩu không đúng!',
  ERR_004_NOT_AUTHENTICATED: 'Bạn phải đăng nhập để truy cập tài nguyên này!',
  ERR_404_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu!',
  ERR_500_INTERNAL_SERVER_ERROR:
    'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau!',
};

export const VALIDATE_ERROR_MESSAGES: Record<string, string> = {
  REQUIRED: 'Trường này là bắt buộc!',
  EMPTY_PHONE_NUMBER: 'Vui lòng nhập số điện thoại!',
  EMPTY_PASSWORD: 'Vui lòng nhập mật khẩu!',
  INVALID_PHONE_NUMBER: 'Số điện thoại không hợp lệ!',
};
