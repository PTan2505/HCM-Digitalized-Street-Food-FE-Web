import type { JSX } from 'react';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { Box, Container, Typography } from '@mui/material';

export default function Footer(): JSX.Element {
  return (
    <Box component="footer" role="contentinfo" sx={{ bgcolor: '#ffffff' }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
            gap: 2,
          }}
        >
          <img
            src={lowcaLogo}
            alt="Lowca"
            style={{ height: 70, width: 'auto' }}
          />
          <Typography
            variant="body2"
            sx={{
              color: '#4b5563',
              lineHeight: 1.8,
              maxWidth: { xs: '100%', md: 760 },
            }}
          >
            Lowca là nền tảng giúp đối tác quản lý và phát triển hoạt động kinh
            doanh ẩm thực một cách hiệu quả. Với hệ thống quản trị tập trung,
            bạn có thể dễ dàng cập nhật thực đơn, quản lý nhiều chi nhánh, theo
            dõi thông tin cửa hàng và tối ưu vận hành mỗi ngày chỉ trên một nền
            tảng duy nhất. Bên cạnh đó, Lowca hỗ trợ tăng khả năng tiếp cận
            khách hàng thông qua hệ thống hiển thị thông minh, đánh giá minh
            bạch và gợi ý nổi bật. Nhờ đó, cửa hàng của bạn không chỉ được quản
            lý tốt hơn mà còn được quảng bá hiệu quả, thu hút thêm nhiều khách
            hàng tiềm năng và gia tăng doanh thu bền vững.
          </Typography>
        </Box>

        <Box
          sx={{
            borderTop: '1px solid #e5e7eb',
            py: 2.5,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            © 2025 Lowca. Được bảo lưu mọi quyền.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
