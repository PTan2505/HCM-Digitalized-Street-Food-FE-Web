interface TermsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsDialog({ open, onClose }: TermsDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Điều khoản sử dụng
          </h2>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold">1. Giới thiệu</strong>
              <br />
              Chào mừng bạn đến với nền tảng của chúng tôi. Bằng cách đăng ký,
              bạn đồng ý tuân thủ các điều khoản và điều kiện sau.
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold">
                2. Trách nhiệm của người bán
              </strong>
              <br />
              - Đảm bảo thông tin đăng ký chính xác và đầy đủ
              <br />
              - Tuân thủ các quy định về vệ sinh an toàn thực phẩm
              <br />
              - Cung cấp dịch vụ chất lượng cho khách hàng
              <br />- Cập nhật thông tin khi có thay đổi
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold">3. Chính sách hoa hồng</strong>
              <br />
              Nền tảng sẽ thu phí hoa hồng theo từng đơn hàng được xác nhận.
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold">4. Quyền và nghĩa vụ</strong>
              <br />
              Chúng tôi có quyền từ chối hoặc đình chỉ tài khoản nếu phát hiện
              vi phạm điều khoản.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#06AA4C] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#058f40]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
