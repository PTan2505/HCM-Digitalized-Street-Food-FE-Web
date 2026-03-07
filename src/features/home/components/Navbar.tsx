import { useState } from 'react';
import type { JSX } from 'react';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { Box, Button, Container, Drawer, IconButton } from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { NAV_LINKS } from '../data/homeData';

export default function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Box
        component="header"
        role="banner"
        className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm"
      >
        <Container maxWidth="xl">
          <Box className="relative flex h-16 items-center justify-between">
            {/* ── Mobile Left: Search ── */}
            <IconButton
              aria-label="Tìm kiếm"
              size="small"
              sx={{
                color: 'text.secondary',
                display: { xs: 'flex', md: 'none' },
              }}
            >
              <SearchIcon sx={{ fontSize: 22 }} />
            </IconButton>

            {/* ── Desktop Left: Logo ── */}
            <Box
              component="a"
              href="#"
              className="shrink-0"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              <img
                src={lowcaLogo}
                alt="Lowca"
                className="h-10 w-auto object-contain"
              />
            </Box>

            {/* ── Mobile Center: Logo (absolute) ── */}
            <Box
              component="a"
              href="#"
              sx={{
                display: { xs: 'block', md: 'none' },
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <img
                src={lowcaLogo}
                alt="Lowca"
                style={{ height: 40, width: 'auto', objectFit: 'contain' }}
              />
            </Box>

            {/* ── Desktop Center: Nav ── */}
            <Box
              component="nav"
              aria-label="Primary navigation"
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
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

            {/* ── Desktop Right: Search + Login ── */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
              }}
            >
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

            {/* ── Mobile Right: Hamburger ── */}
            <IconButton
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: 'text.secondary',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* ── Mobile Drawer ── */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: '75vw', maxWidth: 300 } }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            p: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
            }}
          >
            <img
              src={lowcaLogo}
              alt="Lowca"
              style={{ height: 36, width: 'auto' }}
            />
            <IconButton
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box component="nav" aria-label="Mobile navigation" sx={{ flex: 1 }}>
            {NAV_LINKS.map((link) => (
              <Box
                key={link}
                component="a"
                href="#"
                onClick={() => setMobileOpen(false)}
                sx={{
                  display: 'block',
                  py: 1.75,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  fontWeight: 600,
                  color: 'text.primary',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {link}
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.5, mt: 4 }}
            onClick={() => setMobileOpen(false)}
          >
            Đăng nhập
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
