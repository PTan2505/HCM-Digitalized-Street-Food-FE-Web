import type { JSX } from 'react';
import { Box, Typography } from '@mui/material';
import { Restaurant as ForkIcon } from '@mui/icons-material';

interface RecipeMetaProps {
  type: string;
}

export default function RecipeMeta({ type }: RecipeMetaProps): JSX.Element {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ForkIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {type}
        </Typography>
      </Box>
    </Box>
  );
}
