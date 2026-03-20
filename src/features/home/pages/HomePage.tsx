import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import lightLogo from '../../../assets/ios-light.png';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroCarousel from '../components/HeroCarousel';
import PopularCategoriesSection from '../components/PopularCategoriesSection';
import RecipeCard from '../components/RecipeCard';
import useBranch from '../hooks/useBranch';
import { useAppSelector } from '@hooks/reduxHooks';
import { ROUTES } from '@constants/routes';
import { selectActiveBranches } from '@slices/branch';

export default function HomePage(): JSX.Element {
  const { onGetActiveBranches } = useBranch();
  const activeBranches = useAppSelector(selectActiveBranches);
  const navigate = useNavigate();

  const topFinalScoreBranches = useMemo(() => {
    return [...activeBranches]
      .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
      .slice(0, 8);
  }, [activeBranches]);

  useEffect(() => {
    void onGetActiveBranches({
      pageNumber: 1,
      pageSize: 100,
    });
  }, [onGetActiveBranches]);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
  }, []);

  return (
    <Box className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <Navbar />

      {/* ── Hero Carousel (images only) ── */}
      <Box data-aos="fade-in" data-aos-duration="1000">
        <HeroCarousel />
      </Box>

      <PopularCategoriesSection />

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
              Khám phá hàng ngàn quán ăn nấu ăn ngon từ khắp nơi, từ món ăn
              truyền thống đến hiện đại, giúp bữa ăn của bạn thêm phong phú và
              đầy hương vị.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {topFinalScoreBranches.slice(0, 5).map((branch, index) => (
              <Grid
                key={branch.branchId}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos={index === 0 ? 'fade-right' : 'fade-up'}
              >
                <RecipeCard
                  branchId={branch.branchId}
                  title={branch.vendorName + ' - ' + branch.name}
                  avgRating={branch.avgRating}
                  totalReviewCount={branch.totalReviewCount}
                  address={
                    branch.addressDetail +
                    ', ' +
                    branch.ward +
                    ', ' +
                    branch.city
                  }
                />
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

            {topFinalScoreBranches.slice(5, 8).map((branch) => (
              <Grid
                key={branch.branchId}
                size={{ xs: 12, sm: 6, md: 4 }}
                data-aos="fade-up"
              >
                <RecipeCard
                  branchId={branch.branchId}
                  title={branch.vendorName + ' - ' + branch.name}
                  avgRating={branch.avgRating}
                  totalReviewCount={branch.totalReviewCount}
                  address={
                    branch.addressDetail +
                    ', ' +
                    branch.ward +
                    ', ' +
                    branch.city
                  }
                />
              </Grid>
            ))}
          </Grid>
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
            variant="h4"
            fontWeight={700}
            className="mb-4!"
            color="text.primary"
          >
            Đăng Ký Cửa Hàng Của Bạn Ngay Hôm Nay!
          </Typography>
          <Typography color="text.secondary" className="mb-10!">
            Mở cửa hàng của bạn ngay hôm nay để giới thiệu sản phẩm, tiếp cận
            nhiều khách hàng và phát triển hoạt động kinh doanh trên nền tảng
            của chúng tôi.
          </Typography>
          <Box
            className="mx-auto flex w-full max-w-md justify-center"
            sx={{ minHeight: 56, alignItems: 'center' }}
          >
            <Button
              variant="contained"
              color="primary"
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              sx={{
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                width: { xs: '100%', sm: 220 },
                height: 48,
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
