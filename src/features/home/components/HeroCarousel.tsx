import type { JSX } from 'react';
import { Box, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import Carousel from 'react-multi-carousel';
import type { ResponsiveType } from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

export interface HeroSlide {
  src: string;
  alt: string;
}

const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&q=80',
    alt: 'Cinnamon Apple Loaded Tart',
  },
  {
    src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1400&q=80',
    alt: 'Pan-Fried Crispy Kale Sauce',
  },
  {
    src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1400&q=80',
    alt: 'Berry Moist Breakfast Biscuits',
  },
];

interface HeroCarouselProps {
  slides: HeroSlide[];
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick?: () => void;
}): JSX.Element {
  return (
    <IconButton
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
      disabled={!onClick}
      sx={(theme) => ({
        position: 'absolute',
        left: direction === 'left' ? { xs: 8, md: 24 } : undefined,
        right: direction === 'right' ? { xs: 8, md: 24 } : undefined,
        top: '50%',
        transform: 'translateY(-50%)',
        bgcolor: alpha(theme.palette.common.white, 0.9),
        boxShadow: theme.shadows[3],
        width: 44,
        height: 44,
        '&:hover': {
          bgcolor: theme.palette.common.white,
          transform: 'translateY(-50%) scale(1.05)',
        },
        '&.Mui-disabled': {
          opacity: 0.5,
        },
        transition: 'all 0.2s',
        zIndex: 2,
      })}
    >
      {direction === 'left' ? (
        <ChevronLeft sx={{ color: 'text.primary' }} />
      ) : (
        <ChevronRight sx={{ color: 'text.primary' }} />
      )}
    </IconButton>
  );
}

export default function HeroCarousel({
  slides,
}: HeroCarouselProps): JSX.Element {
  const activeSlides = slides.length > 0 ? slides : FALLBACK_HERO_SLIDES;
  const responsive: ResponsiveType = {
    all: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
    },
  };

  return (
    <Box
      component="section"
      aria-label="Featured recipes carousel"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: theme.palette.grey[900],
        aspectRatio: { xs: '4/3', sm: '16/9', md: '16/7' },
        '& .react-multi-carousel-track': {
          height: '100%',
        },
        '& .react-multi-carousel-item': {
          height: '100%',
        },
        '& .react-multi-carousel-dot-list': {
          bottom: 16,
        },
        '& .react-multi-carousel-dot button': {
          width: 8,
          height: 8,
          borderRadius: 999,
          border: 0,
          boxShadow: 'none',
          backgroundColor: alpha(theme.palette.common.white, 0.5),
          margin: 0,
        },
        '& .react-multi-carousel-dot--active button': {
          width: 28,
          backgroundColor: theme.palette.common.white,
        },
      })}
    >
      <Carousel
        responsive={responsive}
        infinite
        autoPlay
        autoPlaySpeed={5000}
        pauseOnHover
        swipeable
        draggable
        keyBoardControl
        // showDots
        renderArrowsWhenDisabled={false}
        customLeftArrow={<CarouselArrow direction="left" />}
        customRightArrow={<CarouselArrow direction="right" />}
        containerClass="h-full"
        sliderClass="h-full"
        itemClass="h-full"
      >
        {activeSlides.map((slide, i) => (
          <Box key={slide.src} sx={{ height: '100%' }}>
            <Box
              component="img"
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </Box>
        ))}
      </Carousel>
    </Box>
  );
}
