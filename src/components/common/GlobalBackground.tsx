import React from 'react';
import type { Player } from '../../types';
import { THEMES } from '../../constants/cosmetics';
import { MonogramBackground } from './MonogramBackground';

interface GlobalBackgroundProps {
    player?: Player | null;
}

export const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ player }) => {
    // Determine the background style
    // 1. If player has a specific background color/gradient set (from theme purchase), use it.
    // 2. Fallback to activeTheme lookup (if we store ID but not value, though store saves value).
    // 3. Fallback to default dark theme.

    const getBackgroundStyle = () => {
        // Strict Theme Mode: Only use the activeTheme ID to find the global background
        // We do NOT use player.backgroundColor anymore as that is for the avatar only.
        
        if (player?.cosmetics?.activeTheme) {
            const theme = THEMES.find(t => t.id === player.cosmetics?.activeTheme);
            if (theme?.value) return theme.value;
        }

        return 'linear-gradient(180deg, #121212 0%, #000000 100%)'; // Default Dark (matching 'default' theme value roughly)
    };

    const background = getBackgroundStyle();

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Base Background Layer */}
            <div 
                className="absolute inset-0 transition-all duration-700 ease-in-out"
                style={{ background: background }}
            />
            
            {/* Monogram Pattern - Global (visible on all screens) */}
            <MonogramBackground speed="slow" opacity={0.15} />
            
            {/* Optional Overlay Texture/Effects (like the 'overlay' requested) */}
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
            
            {/* Subtle Noise/Grain if we want 'premium' feel */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />
        </div>
    );
};
