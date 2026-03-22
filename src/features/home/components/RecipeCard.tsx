import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Rating } from '@mui/material';
import { axiosApi } from '@lib/api/apiInstance';

export interface RecipeCardProps {
  branchId: number;
  title: string;
  avgRating: number;
  totalReviewCount: number;
  address: string;
  stretch?: boolean;
}

export default function RecipeCard({
  branchId,
  title,
  avgRating,
  totalReviewCount,
  address,
  stretch,
}: RecipeCardProps): JSX.Element {
  const [img, setImg] = useState<string>(
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80'
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchImage = async (): Promise<void> => {
      try {
        const res = await axiosApi.vendorApi.getImages(branchId, {
          pageNumber: 1,
          pageSize: 1,
        });
        if (mounted && res.items && res.items.length > 0) {
          setImg(res.items[0].imageUrl);
        }
      } catch {
        // ignore or fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchImage();
    return (): void => {
      mounted = false;
    };
  }, [branchId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: stretch ? '100%' : undefined,
        overflow: 'hidden',
        borderRadius: 3,
        bgcolor: '#fff',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box
        sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : (
          <img
            src={img}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </Box>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <Rating
              value={avgRating}
              readOnly
              max={5}
              precision={0.1}
              size="small"
              sx={{ '& .MuiRating-iconFilled': { color: '#f5a623' } }}
            />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: 'var(--color-primary-700)' }}
            >
              ({totalReviewCount} đánh giá)
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          fontWeight={600}
          lineHeight={1.4}
          sx={{ flex: 1, mb: 1, color: 'text.primary' }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            mb: 1.5,
            color: 'text.secondary',
          }}
        >
          <Typography variant="caption" lineHeight={1.4}>
            {address}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
