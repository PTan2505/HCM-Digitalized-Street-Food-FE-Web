import logoImage from '@assets/lowca-logo.png';
import Box from '@mui/material/Box';
import { type JSX } from 'react';

export const LoginIntroCarousel = (): JSX.Element => {
  return (
    <Box className="flex h-full w-full flex-col justify-center gap-8 p-3 text-center lg:pr-14">
      <Box className="flex flex-col items-center gap-3">
        <img
          src={logoImage}
          alt="Lowca"
          className="h-20 w-auto object-contain md:h-24"
        />
        {/* <p className="title-md text-[#144820]">Lowca Street Food</p> */}
      </Box>

      <Box className="space-y-4">
        {/* <h2 className="title-xl max-w-3xl text-[#0F3518]">
          Bộ điều khiển web dành riêng cho Đối tác
        </h2> */}
        <p className="title-md mx-auto max-w-3xl font-medium text-[#2E5A3A]">
          Quản lý dễ dàng – Bán hàng hiệu quả.
        </p>
      </Box>

      {/* <Box className="grid grid-cols-1 gap-3 text-left text-[#245632] md:grid-cols-2">
        <Box className="rounded-2xl bg-white/60 p-5 shadow-sm backdrop-blur-sm">
          <p className="body-medium font-bold">Quản lý thực đơn</p>
          <p className="body-small mt-1 text-[#3C6E4A]">
            Thoải mái thêm mới, chỉnh sửa món ăn và giá bán một cách linh hoạt.
          </p>
        </Box>
        <Box className="rounded-2xl bg-white/60 p-5 shadow-sm backdrop-blur-sm">
          <p className="body-medium font-bold">Theo dõi đơn hàng</p>
          <p className="body-small mt-1 text-[#3C6E4A]">
            Kiểm soát trạng thái đơn hàng theo thời gian thực, không bỏ sót yêu
            cầu.
          </p>
        </Box>
        <Box className="rounded-2xl bg-white/60 p-5 shadow-sm backdrop-blur-sm">
          <p className="body-medium font-bold">Chiến dịch & Voucher</p>
          <p className="body-small mt-1 text-[#3C6E4A]">
            Dễ dàng tạo các chương trình khuyến mãi, phát mã giảm giá thu hút và
            giữ chân khách hàng.
          </p>
        </Box>
        <Box className="rounded-2xl bg-white/60 p-5 shadow-sm backdrop-blur-sm">
          <p className="body-medium font-bold">Thống kê & báo cáo</p>
          <p className="body-small mt-1 text-[#3C6E4A]">
            Nắm bắt hiệu suất kinh doanh, món ăn bán chạy và doanh thu rõ ràng,
            chi tiết.
          </p>
        </Box>
      </Box> */}
    </Box>
  );
};
