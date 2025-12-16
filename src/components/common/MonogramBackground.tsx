import React, { useMemo } from 'react';

interface MonogramBackgroundProps {
    speed?: 'normal' | 'slow';
    blur?: 'none' | 'sm' | 'md' | 'lg';
    opacity?: number;
    /** If true, uses fixed positioning to match global background alignment */
    fixed?: boolean;
}

export const MonogramBackground: React.FC<MonogramBackgroundProps> = ({
    speed = 'normal',
    blur = 'none',
    opacity = 0.2,
    fixed = false
}) => {
    // Use FIXED animation direction so all instances sync together
    const patternSize = 240;
    const style = {
        '--pan-x': `${1 * patternSize}px`,
        '--pan-y': `${1 * patternSize}px`,
    } as React.CSSProperties;

    const svgPattern = useMemo(() => {
        const icons = [
            { icon: '🎨', x: 20, y: 40, size: 40, rotate: 15 },
            { icon: '✏️', x: 100, y: 30, size: 35, rotate: -20 },
            { icon: '🖌️', x: 180, y: 45, size: 38, rotate: 10 },
            { icon: '📐', x: 40, y: 140, size: 35, rotate: -15 },
            { icon: '🖊️', x: 120, y: 130, size: 32, rotate: 25 },
            { icon: '✒️', x: 200, y: 150, size: 36, rotate: -10 },
            { icon: '🖍️', x: 80, y: 210, size: 34, rotate: 5 },
            { icon: '📝', x: 160, y: 200, size: 38, rotate: -5 },
        ];

        const svgContent = icons.map((item) =>
            `<text x="${item.x}" y="${item.y}" font-size="${item.size}" transform="rotate(${item.rotate}, ${item.x}, ${item.y})" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif" opacity="1" dominant-baseline="middle" text-anchor="middle">${item.icon}</text>`
        ).join('');

        // Use fill="black" so the mask is opaque (fully visible)
        // The background color of the div will show through.
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
            <style>text { fill: black; }</style>
            ${svgContent}
        </svg>
        `.trim();

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }, []);

    // Sync animations by calculating a negative delay based on absolute time
    // This ensures that regardless of when this component mounts, it joins the animation
    // at the exact same frame as every other instance.
    const animationDurationSeconds = speed === 'slow' ? 60 : 30;
    const panDurationSeconds = speed === 'slow' ? 240 : 120;
    
    // We use a fixed epoch so all clients sync somewhat similarly (optional, but good for consistency)
    // Using Date.now() ensures we get the current progress within the cycle.
    const now = Date.now();
    const cycle1Delay = -((now / 1000) % animationDurationSeconds);
    const cycle2Delay = -((now / 1000) % panDurationSeconds);

    // Blur class based on prop
    const blurClass = {
        'none': '',
        'sm': 'blur-sm',
        'md': 'blur-md',
        'lg': 'blur-lg'
    }[blur];

    // Animation string - include the calculated delays
    const animationString = `pastel-cycle ${animationDurationSeconds}s infinite linear ${cycle1Delay}s, mask-pan ${panDurationSeconds}s infinite linear ${cycle2Delay}s`;

    // Position class - 'fixed' makes it align with global background
    const positionClass = fixed ? 'fixed' : 'absolute';

    return (
        <div
            className={`${positionClass} inset-0 pointer-events-none z-0 overflow-hidden ${blurClass}`}
            style={{ ...style, opacity }}
        >
            <div
                className={`${positionClass} inset-0 w-full h-full`}
                style={{
                    backgroundColor: 'currentColor',
                    maskImage: `url('${svgPattern}')`,
                    WebkitMaskImage: `url('${svgPattern}')`,
                    maskRepeat: 'repeat',
                    WebkitMaskRepeat: 'repeat',
                    maskSize: '240px 240px',
                    WebkitMaskSize: '240px 240px',
                    animation: animationString
                }}
            />
        </div>
    );
};
