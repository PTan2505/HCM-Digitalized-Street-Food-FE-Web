import type { JSX } from 'react';
import { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Rating,
  TextField,
  Typography,
} from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import lightLogo from '../../../assets/ios-light.png';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroCarousel from '../components/HeroCarousel';
import RecipeCard from '../components/RecipeCard';
import LatestRecipeCard from '../components/LatestRecipeCard';
import CollectionCard from '../components/CollectionCard';
import RecipeMeta from '../components/RecipeMeta';
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
            data-aos="fade-up"
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
          <Grid container spacing={2}>
            {CATEGORIES.map((cat, i) => (
              <Grid
                key={cat.name}
                size={{ xs: 6, sm: 4, md: 2 }}
                data-aos="fade-up"
                data-aos-delay={i * 70}
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
          <Box className="mb-12 text-center" data-aos="fade-up">
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
            {/* Large featured card */}
            <Grid size={{ xs: 12, md: 8 }} data-aos="fade-right">
              <Box className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Box
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '16/9' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80"
                    alt="Burger Bữa Sáng Wagyu"
                    className="h-full w-full object-cover"
                  />
                  <Box
                    component="button"
                    className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white transition hover:bg-gray-100"
                    aria-label="Yêu thích"
                  >
                    <FavoriteIcon sx={{ fontSize: 18, color: '#ccc' }} />
                  </Box>
                </Box>
                <Box className="p-6">
                  <Rating
                    value={5}
                    readOnly
                    size="small"
                    sx={{
                      mb: 1,
                      '& .MuiRating-iconFilled': { color: '#f5a623' },
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Burger Wagyu Bữa Sáng Phô Mai Đậm Đà
                  </Typography>
                  <RecipeMeta time="30 phút" type="Món Tây" />
                  <Box className="mt-3 flex items-center gap-2">
                    <img
                      src={`https://i.pravatar.cc/40?u=john`}
                      alt="John Smith"
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <Typography variant="caption" color="text.secondary">
                      John Smith · 15 tháng 3, 2022
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {RECIPES.slice(0, 4).map((r, i) => (
              <Grid
                key={r.title}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <RecipeCard {...r} stretch />
              </Grid>
            ))}

            {/* Ad card */}
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              data-aos="zoom-in"
              data-aos-delay="100"
            >
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

            {RECIPES.slice(4).map((r, i) => (
              <Grid
                key={r.title}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="fade-up"
                data-aos-delay={i * 80}
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
          <Box className="mb-12 text-center" data-aos="fade-up">
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
            {COLLECTIONS.map((col, i) => (
              <Grid
                key={col.title}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="flip-left"
                data-aos-delay={i * 120}
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
            data-aos="fade-up"
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
            {LATEST_RECIPES.map((r, i) => (
              <Grid
                key={r.title}
                size={{ xs: 12, sm: 6, md: 3 }}
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <LatestRecipeCard {...r} />
              </Grid>
            ))}
          </Grid>
          <Box
            className="mt-10 flex justify-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
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
          data-aos-delay="300"
        />
      </Box>

      <Footer />
    </Box>
  );
}
