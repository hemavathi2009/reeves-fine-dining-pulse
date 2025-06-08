import { useState, useRef, useEffect } from 'react';

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(options: SwipeOptions = {}) {
  const { 
    threshold = 50, 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown 
  } = options;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent | TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!touchStartRef.current || !swiping) return;
  };

  const handleTouchEnd = (e: React.TouchEvent | TouchEvent) => {
    if (!touchStartRef.current || !swiping) return;
    
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = touchEnd.clientY - touchStartRef.current.y;
    
    // Determine if the swipe is horizontal or vertical
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isHorizontalSwipe) {
      if (deltaX > threshold) {
        onSwipeRight?.();
      } else if (deltaX < -threshold) {
        onSwipeLeft?.();
      }
    } else {
      if (deltaY > threshold) {
        onSwipeDown?.();
      } else if (deltaY < -threshold) {
        onSwipeUp?.();
      }
    }
    
    touchStartRef.current = null;
    setSwiping(false);
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    swiping
  };
}
