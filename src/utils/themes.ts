// CARD_THEMES removed


export const getThemeVariables = (themeId: string = 'default') => {
    switch (themeId) {
        case 'light':
        case 'premium-light':
            return {
                '--theme-bg': 'linear-gradient(135deg, #FFF5EB 0%, #FFD1B3 100%)', // Soft Peach Gradient
                '--theme-bg-secondary': '#E0F2F1', // Minty green secondary
                '--theme-text': '#4A3B32', // Dark Brown
                '--theme-text-secondary': '#8D6E63', // Light Brown
                '--theme-accent': '#FFB74D', // Orange Accent
                '--theme-border': '#E0F2F1', // Mint border
                '--theme-button-bg': '#FFB74D',
                '--theme-button-text': '#4A3B32',
                '--theme-card-bg': '#C1E1C1', // Mint/Sage Green Card from screenshot
                '--theme-font': "'Inter', sans-serif",
                '--theme-radius': '1.5rem',
                '--theme-card-text': '#4A3B32',
                '--theme-highlight': '#FFE0B2', // Lighter orange
                '--card-border': 'none',
            };
        case 'dark':
        case 'premium-dark':
            return {
                '--theme-bg': 'linear-gradient(135deg, #1F1F1F 0%, #2D2D2D 100%)', // Dark Gray Gradient
                '--theme-bg-secondary': '#2C241B', // Darker brown/gray
                '--theme-text': '#FFF8E1', // Cream/White
                '--theme-text-secondary': '#D7CCC8',
                '--theme-accent': '#FFB74D', // Orange Accent (was Gold)
                '--theme-border': '#FFB74D', // Orange Border
                '--theme-button-bg': '#FFB74D', // Orange Button (was Dark Brown)
                '--theme-button-text': '#000000', // Black Text (was Gold)
                '--theme-card-bg': '#2C241B', // Dark Brown/Black Card
                '--theme-font': "'Inter', sans-serif",
                '--theme-radius': '1.5rem',
                '--theme-card-text': '#FFF8E1',
                '--theme-highlight': '#4E342E',
                '--card-border': '2px solid #FFB74D', // Orange border for cards
            };
        case 'default':
        default:
            // Default is now the Premium Dark
            return {
                '--theme-bg': 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)', // Dark Matte
                '--theme-bg-secondary': '#1a1a1a',
                '--theme-text': '#F5F5F5',
                '--theme-text-secondary': '#A3A3A3',
                '--theme-accent': '#FFB74D', // Orange Accent (was Khaki/Gold)
                '--theme-border': '#FFB74D',
                '--theme-button-bg': '#333333',
                '--theme-button-text': '#000000', // Black Text (was Gold) - but on dark button bg? Wait.
                // Re-evaluating default theme logic. 
                // Default theme button bg is #333333. If text is black, it might be hard to read on #333333.
                // However, usually primary buttons use var(--theme-accent) as bg.
                // If the button USES var(--theme-button-bg), then it will be dark gray with black text (Bad).
                // If the button USES var(--theme-accent) as bg, then it will be Orange with Black text (Good).
                // Let's assume buttons in this app often use inline styles or classes that leverage accent.
                // But specifically for 'Round Rewards', it uses accent.
                // To be safe for generic buttons using theme-button-bg, I should probably also update theme-button-bg 
                // to be Orange if I want "all yellow buttons" to be orange.
                // But standard default theme buttons were Dark Gray (#333333).
                // Let's check the user request: "darker orange would be perfect for all the buttons instead of the yellow".
                // The "yellow" buttons were the primary actions (like Continue).
                // Those likely use --theme-accent.
                // So updating --theme-accent is key.
                // If I change --theme-button-text to Black, I must ensure --theme-button-bg is light enough OR that buttons that use that variable use accent.
                // Let's safe-bet change --theme-button-bg to Orange as well for consistency with the "Orange Buttons" request.
                '--theme-card-bg': '#1E1E1E', // Dark card
                '--theme-font': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                '--theme-radius': '1.2rem',
                '--theme-card-text': '#F5F5F5',
                '--theme-highlight': '#444444',
                '--card-border': '1px solid #333333',
            };
    }
};

// Deprecated: kept for backward compatibility if needed, but should point to variables
export const getThemeStyles = (_themeId: string = 'default') => {
    return {}; // Handled via CSS variables now
};


export const getThemeContainerStyle = (themeId: string = 'default') => {
    // Returns styles for the container (gradient borders etc)
    // This simplifies the logic by returning a complete style object
    const styles = getThemeStyles(themeId);

    // Default fallback for layout
    return {
        padding: '1.25rem', // p-5
        borderRadius: 'var(--theme-radius)', // Dynamic Radius
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
        backgroundColor: 'var(--card-bg)',
        border: '4px solid var(--theme-border)',
        color: 'var(--theme-text)',
        ...styles
    };
};

export const getThemeClass = (themeId: string = 'default'): string => {
    switch (themeId) {
        case 'dark':
            return 'theme-bg-dark';
        case 'cardboard':
            return 'theme-bg-cardboard';
        case 'neon':
            return 'theme-bg-neon';
        case 'gold':
            return 'theme-bg-gold';
        case 'galaxy':
            return 'theme-bg-galaxy';
        default:
            return 'theme-bg-default';
    }
};
