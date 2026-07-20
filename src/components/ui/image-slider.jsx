import { useRef, useState } from 'react';
import Box from '@mui/material/Box';

/**
 * ImageSlider 컴포넌트 — 좌우 스와이프 이미지 슬라이더 (dot 인디케이터)
 *
 * Props:
 * @param {Array} images - 이미지 배열 [{ id, image_url }] [Required]
 * @param {function} onDoubleClick - 이미지 더블탭(더블클릭) 시 실행할 함수 [Optional]
 * @param {function} onClick - 이미지 단일 탭 시 실행할 함수 [Optional]
 *
 * Example usage:
 * <ImageSlider images={ post.images } onDoubleClick={ handleLike } />
 */
function ImageSlider({ images, onDoubleClick, onClick }) {
  const [current, setCurrent] = useState(0);
  const clickTimerRef = useRef(null);

  /** 스크롤 위치로 현재 이미지 인덱스 계산 */
  const handleScroll = (event) => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (clientWidth > 0) setCurrent(Math.round(scrollLeft / clientWidth));
  };

  /** 단일 클릭과 더블 클릭 구분 (250ms 지연) */
  const handleClick = () => {
    if (!onClick) return;
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => onClick(), 250);
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimerRef.current);
    if (onDoubleClick) onDoubleClick();
  };

  if (!images?.length) return null;

  return (
    <Box sx={ { position: 'relative' } }>
      <Box
        onScroll={ handleScroll }
        onClick={ handleClick }
        onDoubleClick={ handleDoubleClick }
        sx={ {
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          aspectRatio: '1 / 1',
          bgcolor: 'action.hover',
        } }
      >
        { images.map((image) => (
          <Box
            key={ image.id ?? image.image_url }
            component="img"
            src={ image.image_url }
            alt="게시물 이미지"
            loading="lazy"
            sx={ {
              width: '100%',
              maxWidth: '100%',
              flexShrink: 0,
              objectFit: 'cover',
              scrollSnapAlign: 'start',
              display: 'block',
            } }
          />
        )) }
      </Box>
      { images.length > 1 && (
        <Box
          sx={ {
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.6,
          } }
        >
          { images.map((image, index) => (
            <Box
              key={ image.id ?? index }
              sx={ {
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: index === current ? 'primary.main' : 'rgba(255,255,255,0.7)',
                boxShadow: 1,
              } }
            />
          )) }
        </Box>
      ) }
    </Box>
  );
}

export default ImageSlider;
