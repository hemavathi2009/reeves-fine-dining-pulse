import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Update the state from the media query
    const listener = () => setMatches(media.matches);
    
    // Check on mount
    listener();
    
    // Listen for changes
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
