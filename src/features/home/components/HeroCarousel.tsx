import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { HERO_SLIDES } from '../data/homeData';

export default function HeroCarousel(): JSX.Element {
  const [current, setCurrent] = useState(0);
  const total = HERO_SLIDES.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + total) % total),
    [total]
  );

  useEffect(() => {
    const id = setInterval(next, 5000);
    return (): void => clearInterval(id);
  }, [next]);

  return (
    <Box
      component="section"
      aria-label="Featured recipes carousel"
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#111',
        aspectRatio: { xs: '4/3', sm: '16/9', md: '16/7' },
      }}
    >
      {/* Slides */}
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${current * 100}%)`,
          willChange: 'transform',
        }}
      >
        {HERO_SLIDES.map((slide, i) => (
          <Box key={i} sx={{ minWidth: '100%', height: '100%', flexShrink: 0 }}>
            <img
              src={slide.src}
              alt={slide.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </Box>
        ))}
      </Box>

      {/* Left Arrow */}
      <IconButton
        onClick={prev}
        aria-label="Previous slide"
        sx={{
          position: 'absolute',
          left: { xs: 8, md: 24 },
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          width: 44,
          height: 44,
          '&:hover': {
            bgcolor: '#fff',
            transform: 'translateY(-50%) scale(1.05)',
          },
          transition: 'all 0.2s',
        }}
      >
        <ChevronLeft sx={{ color: '#333' }} />
      </IconButton>

      {/* Right Arrow */}
      <IconButton
        onClick={next}
        aria-label="Next slide"
        sx={{
          position: 'absolute',
          right: { xs: 8, md: 24 },
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          width: 44,
          height: 44,
          '&:hover': {
            bgcolor: '#fff',
            transform: 'translateY(-50%) scale(1.05)',
          },
          transition: 'all 0.2s',
        }}
      >
        <ChevronRight sx={{ color: '#333' }} />
      </IconButton>

      {/* Dot Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {HERO_SLIDES.map((_, i) => (
          <Box
            key={i}
            component="button"
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            sx={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
              border: 0,
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
