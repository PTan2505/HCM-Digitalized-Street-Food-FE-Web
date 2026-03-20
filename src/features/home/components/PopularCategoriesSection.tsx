import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { onGetAllCategories } = useCategory();
  const categories = useAppSelector(selectCategories);
  const status = useAppSelector(selectCategoryStatus);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = isMobile ? 4 : isTablet ? 6 : 8;

  const totalPages = useMemo((): number => {
    if (categories.length === 0) {
      return 1;
    }

    return Math.ceil(categories.length / itemsPerPage);
  }, [categories.length, itemsPerPage]);

  const pagedCategories = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return categories.slice(startIndex, startIndex + itemsPerPage);
  }, [categories, currentPage, itemsPerPage]);

  const canScrollLeft = currentPage > 0;
  const canScrollRight = currentPage < totalPages - 1;

  const handleArrowScroll = useCallback(
    (direction: 'left' | 'right'): void => {
      setCurrentPage((prevPage) => {
        if (direction === 'left') {
          return Math.max(prevPage - 1, 0);
        }

        return Math.min(prevPage + 1, totalPages - 1);
      });
    },
    [totalPages]
  );

  useEffect(() => {
    void onGetAllCategories();
  }, [onGetAllCategories]);

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages - 1));
  }, [totalPages]);

  return (
    <Box
      component="section"
      className="mt-20"
      aria-labelledby="categories-heading"
    >
      <Container maxWidth="xl">
        <Box
          className="mb-8 flex items-center justify-between"
          data-aos="fade-right"
        >
          <Typography id="categories-heading" variant="h4" fontWeight={700}>
            Danh mục phổ biến
          </Typography>
        </Box>

        {status === 'pending' ? (
          <Box className="flex justify-center py-8">
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box className="relative">
            <IconButton
              aria-label="Cuon danh muc sang trai"
              onClick={(): void => handleArrowScroll('left')}
              disabled={!canScrollLeft}
              sx={{
                position: 'absolute',
                left: { xs: 4, md: -12 },
                top: { xs: 28, sm: '50%', md: 52 },
                transform: { xs: 'none', sm: 'translateY(-50%)', md: 'none' },
                zIndex: 2,
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)',
                '&:hover': {
                  bgcolor: '#f8fafc',
                },
                '&.Mui-disabled': {
                  opacity: 0.4,
                  bgcolor: '#fff',
                },
                width: { xs: 34, md: 40 },
                height: { xs: 34, md: 40 },
              }}
            >
              <ChevronLeft />
            </IconButton>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(4, minmax(0, 1fr))',
                  sm: 'repeat(3, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                  lg: 'repeat(8, minmax(0, 1fr))',
                },
                gap: { xs: 2, sm: 3 },
                px: { xs: 5, md: 8 },
                pt: 1,
                pb: 2,
              }}
            >
              {pagedCategories.map((category, index) => (
                <Box
                  key={category.categoryId}
                  className="group flex cursor-pointer flex-col items-center"
                  data-aos="zoom-in"
                >
                  <Box
                    className="relative overflow-hidden rounded-full shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl"
                    sx={{
                      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.16)',
                      width: { xs: 62, sm: 112, md: 128, lg: 136 },
                      height: { xs: 62, sm: 112, md: 128, lg: 136 },
                    }}
                  >
                    <img
                      src={resolveCategoryImage(
                        category.categoryId,
                        currentPage * itemsPerPage + index
                      )}
                      alt={category.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      mt: { xs: 0.75, md: 1.25 },
                      textAlign: 'center',
                      color: '#111827',
                      lineHeight: 1.2,
                      fontSize: { xs: '0.75rem', md: '1.25rem' },
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              ))}
            </Box>

            <IconButton
              aria-label="Cuon danh muc sang phai"
              onClick={(): void => handleArrowScroll('right')}
              disabled={!canScrollRight}
              sx={{
                position: 'absolute',
                right: { xs: 4, md: -12 },
                top: { xs: 28, sm: '50%', md: 52 },
                transform: { xs: 'none', sm: 'translateY(-50%)', md: 'none' },
                zIndex: 2,
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)',
                '&:hover': {
                  bgcolor: '#f8fafc',
                },
                '&.Mui-disabled': {
                  opacity: 0.4,
                  bgcolor: '#fff',
                },
                width: { xs: 34, md: 40 },
                height: { xs: 34, md: 40 },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        )}
      </Container>
    </Box>
  );
}
