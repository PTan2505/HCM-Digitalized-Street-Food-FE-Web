import type { JSX } from 'react';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { Box, Container, Typography } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';

const FOOTER_COLUMNS = [
  {
    title: 'Công thức',
    links: ['Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Tráng miệng'],
  },
  {
    title: 'Công ty',
    links: ['Về chúng tôi', 'Liên hệ', 'Tuyển dụng', 'Tin tức'],
  },
  {
    title: 'Pháp lý',
    links: ['Giải đáp pháp lý', 'Bảo mật', 'Cookie'],
  },
];

export default function Footer(): JSX.Element {
  return (
    <Box
      component="footer"
      className="w-full bg-[#1a1a1a] py-20 text-white"
      role="contentinfo"
    >
      <Container maxWidth="xl">
        <Box className="mb-16 flex flex-wrap justify-between gap-8">
          <Box className="max-w-xs">
            <img
              src={lowcaLogo}
              alt="Lowca"
              className="mb-6 h-auto w-36 brightness-0 invert"
            />
            <Typography
              variant="body2"
              className="text-gray-400"
              sx={{ lineHeight: 1.8 }}
            >
              Khám phá hàng ngàn quán ăn ngon, giúp bữa ăn của bạn thêm phong
              phú mỗi ngày.
            </Typography>
            <Box className="mt-6 flex gap-4">
              <Box
                component="a"
                href="#"
                aria-label="Facebook"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <FacebookIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box
                component="a"
                href="#"
                aria-label="Twitter"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <TwitterIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box
                component="a"
                href="#"
                aria-label="Instagram"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <InstagramIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>
          </Box>
          <Box className="flex flex-wrap gap-20">
            {FOOTER_COLUMNS.map((col) => (
              <Box key={col.title} className="flex flex-col">
                <Typography fontWeight={700} className="mb-6! text-white">
                  {col.title}
                </Typography>
                <Box
                  component="ul"
                  className="m-0 flex list-none flex-col gap-4 p-0"
                >
                  {col.links.map((link) => (
                    <Box component="li" key={link}>
                      <Box
                        component="a"
                        href="#"
                        className="body-medium text-gray-400 no-underline transition-colors hover:text-white"
                      >
                        {link}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box className="flex items-center justify-between border-t border-[#333] pt-10">
          <Typography variant="body2" className="text-gray-400">
            © 2025 Lowca. Được bảo lưu mọi quyền.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
