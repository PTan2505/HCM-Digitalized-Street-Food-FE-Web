import type { JSX } from 'react';
import { useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useAppSelector } from '@hooks/reduxHooks';
import useCategory from '@features/home/hooks/useCategory';
import { selectCategories, selectCategoryStatus } from '@slices/category';

const CATEGORY_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
];

function resolveCategoryImage(categoryId: number, index: number): string {
  const imageIndex = (categoryId + index) % CATEGORY_IMAGES.length;
  return CATEGORY_IMAGES[imageIndex];
}

export default function PopularCategoriesSection(): JSX.Element {
  const { onGetAllCategories } = useCategory();
  const categories = useAppSelector(selectCategories);
  const status = useAppSelector(selectCategoryStatus);

  useEffect(() => {
    void onGetAllCategories();
  }, [onGetAllCategories]);

  return (
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

        {status === 'pending' ? (
          <Box className="flex justify-center py-8">
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid
                key={category.categoryId}
                size={{ xs: 6, sm: 4, md: 2 }}
                data-aos="zoom-in"
              >
                <Box
                  className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all duration-400 hover:-translate-y-1.5 hover:shadow-2xl"
                  sx={{ aspectRatio: '3/4' }}
                >
                  <img
                    src={resolveCategoryImage(category.categoryId, index)}
                    alt={category.name}
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
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
                      transition: 'opacity 0.3s',
                    }}
                  />
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
                    {category.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
