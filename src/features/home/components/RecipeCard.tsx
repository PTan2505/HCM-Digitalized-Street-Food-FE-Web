import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { Box, Rating, Typography, Skeleton } from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import RecipeMeta from './RecipeMeta';
import { axiosApi } from '@lib/api/apiInstance';

export interface RecipeCardProps {
  branchId: number;
  title: string;
  type: string;
  rating: number;
  distanceKm: number;
  address: string;
  stretch?: boolean;
}

export default function RecipeCard({
  branchId,
  title,
  type,
  rating,
  distanceKm,
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
        <Box
          component="button"
          aria-label="Save"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#fff',
            border: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: '#f5f5f5' },
            transition: 'background 0.2s',
          }}
        >
          <BookmarkIcon sx={{ fontSize: 16, color: '#ccc' }} />
        </Box>
      </Box>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Rating
          value={rating}
          readOnly
          size="small"
          precision={0.1}
          sx={{ mb: 1, '& .MuiRating-iconFilled': { color: '#f5a623' } }}
        />
        <Box
          sx={{
            mb: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: 'var(--color-primary-700)' }}
          >
            {(distanceKm ?? 0).toFixed(2)} km
          </Typography>
          <RecipeMeta type={type} />
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
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.5,
            mb: 1.5,
            color: 'text.secondary',
          }}
        >
          <LocationOnIcon sx={{ fontSize: 16, mt: 0.2 }} />
          <Typography variant="caption" lineHeight={1.4}>
            {address}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
