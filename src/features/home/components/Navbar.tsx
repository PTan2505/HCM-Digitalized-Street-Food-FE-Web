import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import {
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ROUTES } from '@constants/routes';
import { useNavigate } from 'react-router-dom';

export default function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navbarHeight = isScrolled ? 60 : 70;
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return (): void => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Box
        sx={{ height: `${navbarHeight}px`, transition: 'height 0.25s ease' }}
      />

      <Box
        component="header"
        role="banner"
        className="fixed top-0 right-0 left-0 z-50 w-full border-b border-gray-100 bg-white transition-all duration-300"
        sx={{
          boxShadow: isScrolled
            ? '0 8px 20px rgba(0,0,0,0.08)'
            : '0 1px 6px rgba(0,0,0,0.06)',
          backdropFilter: isScrolled ? 'blur(6px)' : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Box
            className="relative flex items-center justify-between"
            sx={{
              height: navbarHeight,
              transition: 'height 0.25s ease',
            }}
          >
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

            {/* ── Desktop Right: Search + Login ── */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* <TextField
                id="standard-search"
                label="Tìm kiếm"
                type="text"
                variant="standard"
                sx={{
                  width: '30ch',
                  mr: 2,
                  mb: 2,
                  '& .MuiInputBase-root': {
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 0,
                    padding: 0,
                    height: 'auto',
                    color: 'inherit',
                  },
                  '& .MuiInputBase-root.Mui-focused': {
                    border: 'none',
                    color: 'inherit',
                  },
                }}
              /> */}
              <Button
                size="small"
                variant="outlined"
                color="primary"
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.75,
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

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.5, mt: 'auto' }}
            onClick={() => setMobileOpen(false)}
          >
            Đăng nhập
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
