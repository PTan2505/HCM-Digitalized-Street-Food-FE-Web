import type { JSX } from 'react';
import { Box, Rating, Typography } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import RecipeMeta from './RecipeMeta';

export interface LatestRecipeCardProps {
  img: string;
  title: string;
  time: string;
  type: string;
  rating: number;
  author: string;
  date: string;
}

export default function LatestRecipeCard({
  img,
  title,
  time,
  type,
  rating,
  author,
  date,
}: LatestRecipeCardProps): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
        sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}
      >
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
        <Box
          component="button"
          aria-label="Add to favorites"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
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
          <FavoriteIcon sx={{ fontSize: 14, color: '#ccc' }} />
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Rating
          value={rating}
          readOnly
          size="small"
          sx={{ mb: 0.75, '& .MuiRating-iconFilled': { color: '#f5a623' } }}
        />
        <Typography
          variant="body2"
          fontWeight={600}
          lineHeight={1.35}
          sx={{ mb: 0.75, color: 'text.primary', fontSize: '0.8rem' }}
        >
          {title}
        </Typography>
        <RecipeMeta time={time} type={type} />
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25 }}
        >
          <img
            src={`https://i.pravatar.cc/40?u=${encodeURIComponent(author)}`}
            alt={author}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.7rem' }}
          >
            {author} · {date}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
