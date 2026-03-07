import type { JSX } from 'react';
import { Box, Rating, Typography } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import RecipeMeta from './RecipeMeta';

export interface RecipeCardProps {
  img: string;
  title: string;
  time: string;
  type: string;
  rating: number;
  author: string;
  date: string;
  stretch?: boolean;
}

export default function RecipeCard({
  img,
  title,
  time,
  type,
  rating,
  author,
  date,
  stretch,
}: RecipeCardProps): JSX.Element {
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
          <FavoriteIcon sx={{ fontSize: 16, color: '#ccc' }} />
        </Box>
      </Box>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Rating
          value={rating}
          readOnly
          size="small"
          sx={{ mb: 1, '& .MuiRating-iconFilled': { color: '#f5a623' } }}
        />
        <Typography
          variant="body2"
          fontWeight={600}
          lineHeight={1.4}
          sx={{ flex: 1, mb: 1, color: 'text.primary' }}
        >
          {title}
        </Typography>
        <RecipeMeta time={time} type={type} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <img
            src={`https://i.pravatar.cc/40?u=${encodeURIComponent(author)}`}
            alt={author}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              display="block"
              lineHeight={1.2}
            >
              {author}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              lineHeight={1.2}
            >
              {date}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
