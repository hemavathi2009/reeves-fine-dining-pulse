import { useState, useEffect, useRef } from 'react';

type GestureHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
};

export function useTouchGestures(ref: React.RefObject<HTMLElement>, handlers: GestureHandlers) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onLongPress } = handlers;
  
  // Long press timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Touch tracking
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  
  // Constants
  const minSwipeDistance = 50; // Minimum distance for swipe
  const longPressDelay = 500; // Delay for long press in ms

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
      
      // Start long press timer
      if (onLongPress) {
        timerRef.current = setTimeout(() => {
          onLongPress();
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if moved
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Cancel long press
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Calculate distances
      const horizontalDistance = touchStart.x - touchEnd.x;
      const verticalDistance = touchStart.y - touchEnd.y;
      
      // Check if it was a tap (minimal movement)
      const isTap = Math.abs(horizontalDistance) < 10 && Math.abs(verticalDistance) < 10;
      if (isTap && onTap) {
        onTap();
        return;
      }
      
      // Determine if horizontal or vertical swipe
      const isHorizontalSwipe = Math.abs(horizontalDistance) > Math.abs(verticalDistance);
      
      if (isHorizontalSwipe) {
        if (horizontalDistance > minSwipeDistance && onSwipeLeft) {
          onSwipeLeft();
        } else if (horizontalDistance < -minSwipeDistance && onSwipeRight) {
          onSwipeRight();
        }
      } else {
        if (verticalDistance > minSwipeDistance && onSwipeUp) {
          onSwipeUp();
        } else if (verticalDistance < -minSwipeDistance && onSwipeDown) {
          onSwipeDown();
        }
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ref, touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onLongPress]);
}
