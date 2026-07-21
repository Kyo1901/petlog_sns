import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const PULL_THRESHOLD = 64;
const MAX_PULL = 96;

/**
 * PullToRefresh 컴포넌트 — 당겨서 새로고침 래퍼 (터치 전용)
 * - 페이지 최상단에서 아래로 당기면 인디케이터 표시 후 onRefresh 실행
 *
 * Props:
 * @param {function} onRefresh - 새로고침 시 실행할 비동기 함수 [Required]
 * @param {node} children - 새로고침 대상 콘텐츠 [Required]
 *
 * Example usage:
 * <PullToRefresh onRefresh={ () => loadPage(0, true) }>{ content }</PullToRefresh>
 */
function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(null);

  const handleTouchStart = (event) => {
    if (window.scrollY <= 0 && !isRefreshing) {
      startYRef.current = event.touches[0].clientY;
    } else {
      startYRef.current = null;
    }
  };

  const handleTouchMove = (event) => {
    if (startYRef.current === null) return;
    const delta = event.touches[0].clientY - startYRef.current;
    /* 저항감을 주기 위해 당긴 거리의 절반만 반영 */
    setPullDistance(delta > 0 ? Math.min(delta * 0.5, MAX_PULL) : 0);
  };

  const handleTouchEnd = async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <Box onTouchStart={ handleTouchStart } onTouchMove={ handleTouchMove } onTouchEnd={ handleTouchEnd }>
      <Box
        sx={ {
          height: pullDistance,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: isRefreshing || pullDistance === 0 ? 'height 0.2s ease' : 'none',
        } }
      >
        { pullDistance > 0 && (
          <CircularProgress
            size={ 22 }
            variant={ isRefreshing ? 'indeterminate' : 'determinate' }
            value={ Math.min((pullDistance / PULL_THRESHOLD) * 100, 100) }
          />
        ) }
      </Box>
      { children }
    </Box>
  );
}

export default PullToRefresh;
