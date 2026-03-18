import { useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
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
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) =>
    (_: SyntheticEvent, isExpanded: boolean): void => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box component="footer" role="contentinfo">
      {/* ── MOBILE FOOTER ── */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: '#ffffff',
          pt: 5,
          pb: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Logo + description */}
          <Box sx={{ mb: 4 }}>
            <img
              src={lowcaLogo}
              alt="Lowca"
              style={{ height: 40, width: 'auto', marginBottom: 12 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.8 }}
            >
              Khám phá hàng ngàn quán ăn ngon, giúp bữa ăn của bạn thêm phong
              phú mỗi ngày.
            </Typography>
          </Box>

          {/* Accordion sections */}
          {FOOTER_COLUMNS.map((col) => (
            <Accordion
              key={col.title}
              expanded={expanded === col.title}
              onChange={handleChange(col.title)}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: 'transparent',
                '&::before': { display: 'none' },
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 0, py: 0.5 }}
              >
                <Typography fontWeight={700} variant="body1">
                  {col.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pb: 2 }}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {col.links.map((link) => (
                    <Box
                      key={link}
                      component="a"
                      href="#"
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': { color: 'text.primary' },
                      }}
                    >
                      {link}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          <Typography variant="caption" color="text.secondary">
            © 2025 Lowca. Được bảo lưu mọi quyền.
          </Typography>
        </Container>
      </Box>

      {/* ── DESKTOP FOOTER ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          bgcolor: '#ffffff',
          py: 10,
        }}
      >
        <Container maxWidth="xl">
          <Box className="mb-16 flex flex-wrap justify-between gap-8">
            <Box className="max-w-xs">
              <img
                src={lowcaLogo}
                alt="Lowca"
                className="mb-6 h-auto w-36 object-contain"
              />
              <Typography
                variant="body2"
                sx={{ color: '#9ca3af', lineHeight: 1.8 }}
              >
                Khám phá hàng ngàn quán ăn ngon, giúp bữa ăn của bạn thêm phong
                phú mỗi ngày.
              </Typography>
            </Box>
            <Box className="flex flex-wrap gap-20">
              {FOOTER_COLUMNS.map((col) => (
                <Box key={col.title} className="flex flex-col">
                  <Typography fontWeight={700} sx={{ mb: 3, color: '#fff' }}>
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
                          sx={{
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            textDecoration: 'none',
                            '&:hover': { color: '#fff' },
                          }}
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
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              © 2025 Lowca. Được bảo lưu mọi quyền.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
