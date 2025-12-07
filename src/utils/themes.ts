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
                '--theme-accent': '#FFD54F', // Gold
                '--theme-border': '#FFD54F', // Gold Border
                '--theme-button-bg': '#3E2723', // Dark Brown Button
                '--theme-button-text': '#FFD54F', // Gold Text
                '--theme-card-bg': '#2C241B', // Dark Brown/Black Card
                '--theme-font': "'Inter', sans-serif",
                '--theme-radius': '1.5rem',
                '--theme-card-text': '#FFF8E1',
                '--theme-highlight': '#4E342E',
                '--card-border': '2px solid #FFD54F', // Gold border for cards
            };
        case 'default':
        default:
            // Default is now the Premium Dark
            return {
                '--theme-bg': 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)', // Dark Matte
                '--theme-bg-secondary': '#1a1a1a',
                '--theme-text': '#F5F5F5',
                '--theme-text-secondary': '#A3A3A3',
                '--theme-accent': '#F0E68C', // Khaki/Gold
                '--theme-border': '#F0E68C',
                '--theme-button-bg': '#333333',
                '--theme-button-text': '#F0E68C',
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
