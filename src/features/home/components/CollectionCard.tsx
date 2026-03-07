import type { JSX } from 'react';
import { Box, Typography } from '@mui/material';

export interface CollectionCardProps {
  img: string;
  title: string;
  count: number;
}

export default function CollectionCard({
  img,
  title,
  count,
}: CollectionCardProps): JSX.Element {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        aspectRatio: '4/3',
        cursor: 'pointer',
        '&:hover img': { transform: 'scale(1.06)' },
      }}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.4s ease',
        }}
      />
      {/* Dark gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
        }}
      />
      {/* Text overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: '#fff', lineHeight: 1.3, maxWidth: '70%' }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            backdropFilter: 'blur(4px)',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
          >
            {count} Recipes
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
