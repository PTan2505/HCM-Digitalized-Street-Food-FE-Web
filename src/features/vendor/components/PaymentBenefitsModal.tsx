import React from 'react';
import type { JSX } from 'react';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PaymentIcon from '@mui/icons-material/Payment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

interface PaymentBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isPaying: boolean;
}

export default function PaymentBenefitsModal({
  isOpen,
  onClose,
  onContinue,
  isPaying,
}: PaymentBenefitsModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <Box
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={isPaying ? undefined : onClose}
    >
      <Box
        className="mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <VendorModalHeader
          title="Mở khóa quyền lợi đặc quyền"
          subtitle="Trở thành đối tác chính thức ngay hôm nay"
          icon={<WorkspacePremiumIcon />}
          onClose={onClose}
          disableClose={isPaying}
        />

        {/* Modal Content */}
        <Box className="flex-1 overflow-y-auto px-8 py-6">
          <Box className="flex flex-col gap-6">
            <Box
              sx={{
                position: 'relative',
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #3b82f6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <Typography className="text-table-text-secondary text-[15px] leading-relaxed font-medium">
                Kích hoạt gói đăng ký cho chi nhánh của bạn để tận hưởng những
                công cụ mạnh mẽ, giúp nâng cao trải nghiệm khách hàng và tăng
                trưởng doanh thu không giới hạn.
              </Typography>
            </Box>

            {/* Chiến dịch & Tiếp thị */}
            <Box className="rounded-xl border border-gray-100 bg-slate-50/50 p-6 shadow-sm">
              <Typography
                variant="h3"
                className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase"
              >
                <Box
                  component="span"
                  className="h-2.5 w-2.5 rounded-full bg-blue-500"
                ></Box>
                Chiến dịch & Tiếp thị
              </Typography>
              <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Box className="flex items-start gap-4 rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <Box className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CampaignIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      className="text-table-text-primary mb-1 text-base font-bold"
                    >
                      Tạo Chiến Dịch Khuyến Mãi
                    </Typography>
                    <Typography className="text-table-text-secondary text-sm leading-relaxed">
                      Tự do tạo các chương trình giảm giá, khuyến mãi để kích
                      cầu và thu hút thêm hàng ngàn thực khách mới mỗi ngày.
                      Tăng tính cạnh tranh của cửa hàng.
                    </Typography>
                  </Box>
                </Box>

                <Box className="flex items-start gap-4 rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <Box className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <LoyaltyIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      className="text-table-text-primary mb-1 text-base font-bold"
                    >
                      Tham Gia Chiến Dịch Hệ Thống
                    </Typography>
                    <Typography className="text-table-text-secondary text-sm leading-relaxed">
                      Được quyền tham gia vào các chiến dịch chung do hệ thống
                      tổ chức để đưa thương hiệu của bạn tiếp cận nhiều khách
                      hàng hơn.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Quản lý bán hàng & Thống kê */}
            <Box className="rounded-xl border border-gray-100 bg-slate-50/50 p-6 shadow-sm">
              <Typography
                variant="h3"
                className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase"
              >
                <Box
                  component="span"
                  className="h-2.5 w-2.5 rounded-full bg-indigo-500"
                ></Box>
                Quản lý bán hàng
              </Typography>
              <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Box className="flex items-start gap-4 rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <Box className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <RestaurantMenuIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      className="text-table-text-primary mb-1 text-base font-bold"
                    >
                      Đơn Hàng Trực Tuyến
                    </Typography>
                    <Typography className="text-table-text-secondary text-sm leading-relaxed">
                      Cho phép khách hàng xem menu, đặt món và thanh toán trực
                      tiếp qua ứng dụng Lowca.
                    </Typography>
                  </Box>
                </Box>

                <Box className="flex items-start gap-4 rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <Box className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <ManageAccountsIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      className="text-table-text-primary mb-1 text-base font-bold"
                    >
                      Quản Lý Chi Nhánh
                    </Typography>
                    <Typography className="text-table-text-secondary text-sm leading-relaxed">
                      Được quyền thay đổi và cập nhật người quản lý của chi nhánh để tối ưu hóa việc vận hành.
                    </Typography>
                  </Box>
                </Box>

                {/* <Box className="flex items-start gap-4 rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <Box className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <MenuBookIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      className="text-table-text-primary mb-1 text-base font-bold"
                    >
                      Hiển Thị Thực Đơn
                    </Typography>
                    <Typography className="text-table-text-secondary text-sm leading-relaxed">
                      Mở khoá quyền thêm các món ăn vào hồ sơ chi nhánh. Giúp
                      thực khách dễ dàng tìm kiếm và xem trước món ngon của bạn.
                    </Typography>
                  </Box>
                </Box> */}

                {/* <Box className="flex items-start gap-4 rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <Box className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <AutoGraphIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      className="mb-1 text-base font-bold text-[var(--color-table-text-primary)]"
                    >
                      Báo Cáo Chi Tiết
                    </Typography>
                    <Typography className="text-sm leading-relaxed text-[var(--color-table-text-secondary)]">
                      Theo dõi sát sao hiệu quả kinh doanh qua các biểu đồ doanh
                      thu, lượt xem và tương tác của khách.
                    </Typography>
                  </Box>
                </Box> */}
              </Box>
            </Box>

            {/* Quyền lợi khác */}
            {/* <Box className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <Typography
                variant="h3"
                className="mb-2 flex items-center gap-2 text-sm font-bold tracking-wider text-amber-700 uppercase"
              >
                <Box
                  component="span"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 pb-[1px] text-xs"
                >
                  ✨
                </Box>
                Và Nhiều Quyền Lợi Khác
              </Typography>
              <Typography className="pl-7 text-sm leading-relaxed font-medium text-amber-800/80">
                Hiển thị huy hiệu đối tác chính thức, ưu tiên gợi ý trên bản đồ,
                hỗ trợ kỹ thuật CSKH 24/7 và các quyền lợi đặc quyền cập nhật
                liên tục.
              </Typography>
            </Box> */}
          </Box>
        </Box>

        {/* Modal Actions */}
        <Box className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-5">
          <Box>
            <Button
              onClick={onContinue}
              type="button"
              disabled={isPaying}
              variant="outlined"
              color="primary"
              startIcon={
                isPaying ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <PaymentIcon fontSize="small" />
                )
              }
            >
              Thanh toán ngay
            </Button>
          </Box>
          <Button
            onClick={onClose}
            disabled={isPaying}
            type="button"
            className="text-table-text-secondary rounded-lg px-4 py-2 font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
            sx={{
              textTransform: 'none',
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            Để sau
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
