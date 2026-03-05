import type { JSX } from 'react';
import { Box, Typography } from '@mui/material';
import {
  AccessTime as TimerIcon,
  Restaurant as ForkIcon,
} from '@mui/icons-material';

interface RecipeMetaProps {
  time: string;
  type: string;
}

export default function RecipeMeta({
  time,
  type,
}: RecipeMetaProps): JSX.Element {
  return (
    <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TimerIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {time}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ForkIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {type}
        </Typography>
      </Box>
    </Box>
  );
}
