import type { JSX } from 'react';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { Box, Button, Container, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { NAV_LINKS } from '../data/homeData';

export default function Navbar(): JSX.Element {
  return (
    <Box
      component="header"
      role="banner"
      className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm"
    >
      <Container maxWidth="xl">
        <Box className="flex h-16 items-center justify-between">
          {/* ── Logo ── */}
          <Box component="a" href="#" className="shrink-0">
            <img
              src={lowcaLogo}
              alt="Lowca"
              className="h-10 w-auto object-contain"
            />
          </Box>

          {/* ── Primary Nav ── */}
          <Box
            component="nav"
            aria-label="Primary navigation"
            className="absolute left-1/2 -translate-x-1/2"
          >
            <Box component="ul" className="m-0 flex list-none gap-10 p-0">
              {NAV_LINKS.map((link) => (
                <Box component="li" key={link}>
                  <Box
                    component="a"
                    href="#"
                    className="hover:text-primary-600 text-sm font-semibold text-gray-700 no-underline transition-colors"
                  >
                    {link}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Right: search + login ── */}
          <Box className="flex items-center gap-2">
            <IconButton
              aria-label="Tìm kiếm"
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <SearchIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                '&:hover': { bgcolor: 'var(--color-primary-50)' },
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
