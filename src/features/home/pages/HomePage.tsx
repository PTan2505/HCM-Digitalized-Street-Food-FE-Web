import type { JSX } from 'react';
import { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import lightLogo from '../../../assets/ios-light.png';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroCarousel from '../components/HeroCarousel';
import RecipeCard from '../components/RecipeCard';
import LatestRecipeCard from '../components/LatestRecipeCard';
import CollectionCard from '../components/CollectionCard';
import {
  CATEGORIES,
  RECIPES,
  COLLECTIONS,
  LATEST_RECIPES,
  LOREM,
} from '../data/homeData';

export default function HomePage(): JSX.Element {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
  }, []);

  return (
    <Box className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* ── Hero Carousel (images only) ── */}
      <Box data-aos="fade-in" data-aos-duration="1000">
        <HeroCarousel />
      </Box>

      {/* ── Popular Categories ── */}
      <Box
        component="section"
        className="mt-20"
        aria-labelledby="categories-heading"
      >
        <Container maxWidth="xl">
          <Box
            className="mb-10 flex items-center justify-between"
            data-aos="fade-right"
          >
            <Typography id="categories-heading" variant="h4" fontWeight={700}>
              Danh mục phổ biến
            </Typography>
            <Button
              variant="text"
              color="primary"
              sx={{
                fontWeight: 700,
                '&:hover': { bgcolor: 'var(--color-primary-50)' },
              }}
            >
              Xem tất cả →
            </Button>
          </Box>
          <Grid container spacing={3}>
            {CATEGORIES.map((cat) => (
              <Grid
                key={cat.name}
                size={{ xs: 6, sm: 4, md: 2 }}
                data-aos="zoom-in"
              >
                <Box
                  className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all duration-400 hover:-translate-y-1.5 hover:shadow-2xl"
                  sx={{ aspectRatio: '3/4' }}
                >
                  {/* Background image */}
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition:
                        'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
                    }}
                    className="group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
                      transition: 'opacity 0.3s',
                    }}
                  />
                  {/* Category label */}
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      color: '#fff',
                      px: 1.5,
                      lineHeight: 1.3,
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                      letterSpacing: 0.3,
                    }}
                  >
                    {cat.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Super Delicious ── */}
      <Box
        component="section"
        className="mt-20"
        aria-labelledby="super-delicious-heading"
      >
        <Container maxWidth="xl">
          <Box className="mb-12 text-center" data-aos="fade-left">
            <Typography
              id="super-delicious-heading"
              variant="h4"
              fontWeight={700}
              className="mb-4!"
            >
              Những Quán Ăn Ngon Nhất Thành Phố
            </Typography>
            <Typography color="text.secondary" className="mx-auto max-w-xl">
              {LOREM}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} data-aos="fade-right">
              <RecipeCard
                img="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80"
                title="Burger Wagyu Bữa Sáng Phô Mai Đậm Đà"
                time="30 phút"
                type="Món Tây"
                rating={5}
                author="John Smith"
                date="15 March 2022"
              />
            </Grid>

            {RECIPES.slice(0, 4).map((r) => (
              <Grid
                key={r.title}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="fade-up"
              >
                <RecipeCard {...r} />
              </Grid>
            ))}

            {/* Ad card */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }} data-aos="zoom-in">
              <Box
                className="from-primary-50 to-primary-100 relative flex h-full items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br p-10"
                style={{ minHeight: 200 }}
              >
                <Box className="relative z-10 text-center">
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    className="mb-3!"
                    color="text.primary"
                  >
                    Đừng quên ăn đủ chất dinh dưỡng mỗi ngày!
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    www.lowca.vn
                  </Typography>
                </Box>
                <img
                  src={lightLogo}
                  alt="light logo"
                  aria-hidden={true}
                  className="absolute right-2.5 bottom-2.5 h-18 w-18 object-contain"
                />
              </Box>
            </Grid>

            {RECIPES.slice(4).map((r) => (
              <Grid
                key={r.title}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="fade-up"
              >
                <RecipeCard {...r} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Curated Collections ── */}
      <Box
        component="section"
        className="mt-20"
        aria-labelledby="collections-heading"
      >
        <Container maxWidth="xl">
          <Box className="mb-12 text-center" data-aos="fade-right">
            <Typography
              id="collections-heading"
              variant="h4"
              fontWeight={700}
              className="mb-4!"
            >
              Bộ Sưu Tập Công Thức
            </Typography>
            <Typography color="text.secondary" className="mx-auto max-w-xl">
              {LOREM}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {COLLECTIONS.map((col) => (
              <Grid
                key={col.title}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="flip-left"
              >
                <CollectionCard {...col} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Latest Recipes ── */}
      <Box
        component="section"
        className="mt-20"
        aria-labelledby="latest-recipes-heading"
      >
        <Container maxWidth="xl">
          <Box
            className="mb-10 flex items-center justify-between"
            data-aos="fade-left"
          >
            <Typography
              id="latest-recipes-heading"
              variant="h4"
              fontWeight={700}
            >
              Công Thức Mới Nhất
            </Typography>
            <Button
              variant="text"
              color="primary"
              sx={{
                fontWeight: 700,
                '&:hover': { bgcolor: 'var(--color-primary-50)' },
              }}
            >
              Xem tất cả →
            </Button>
          </Box>
          <Grid container spacing={3}>
            {LATEST_RECIPES.map((r) => (
              <Grid
                key={r.title}
                size={{ xs: 12, sm: 6, md: 3 }}
                data-aos="zoom-in"
              >
                <LatestRecipeCard {...r} />
              </Grid>
            ))}
          </Grid>
          <Box className="mt-10 flex justify-center" data-aos="fade-up">
            <Button
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: 3,
                px: 5,
                py: 1.5,
                fontWeight: 700,
                '&:hover': { bgcolor: 'var(--color-primary-50)' },
              }}
            >
              Tải thêm
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Newsletter ── */}
      <Box
        component="section"
        className="bg-primary-50 relative mt-24 flex w-full items-center justify-center overflow-hidden py-20"
        aria-labelledby="newsletter-heading"
      >
        <Box
          className="relative z-10 max-w-lg px-4 text-center"
          data-aos="fade-up"
        >
          <Typography
            id="newsletter-heading"
            variant="h3"
            fontWeight={700}
            className="mb-4!"
            color="text.primary"
          >
            Ưu Đãi Đến Tận Hộp Thư!
          </Typography>
          <Typography color="text.secondary" className="mb-10!">
            {LOREM}
          </Typography>
          <Box className="mx-auto flex max-w-md gap-3">
            <TextField
              type="email"
              placeholder="Địa chỉ email của bạn..."
              variant="outlined"
              size="small"
              fullWidth
              required
              sx={{
                bgcolor: '#fff',
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                px: 3,
              }}
            >
              Đăng ký
            </Button>
          </Box>
        </Box>
        <img
          src="img/newsletter-image.png"
          alt=""
          aria-hidden={true}
          className="absolute right-[8%] bottom-0 z-0 h-auto w-72 object-contain"
          data-aos="fade-left"
        />
      </Box>

      <Footer />
    </Box>
  );
}
