import { useEffect } from 'react';

const FONTS = [
  'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Comic+Neue:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Press+Start+2P&family=VT323&display=swap'
];

export const FontLoader = () => {
  useEffect(() => {
    // Check if fonts are already loaded to avoid redundant requests
    const isLoaded = document.querySelector('link[href="' + FONTS[0] + '"]');
    if (isLoaded) return;

    const link = document.createElement('link');
    link.href = FONTS[0];
    link.rel = 'stylesheet';
    link.media = 'print';
    
    // On load, switch media to all to apply styles (standard non-blocking pattern)
    link.onload = () => {
      link.media = 'all';
    };

    document.head.appendChild(link);

    return () => {
      // Optional: Cleanup if we wanted to unload fonts, but usually we don't
    };
  }, []);

  return null;
};
