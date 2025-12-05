export const vibrate = (pattern: number | number[] = 10) => {
    // Check for support
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Ignore errors (some browsers restrict vibration)
        }
    }
};

export const HapticPatterns = {
    soft: 5,
    light: 10,
    medium: 20,
    heavy: 40,
    success: [10, 30, 10],
    warning: [30, 50, 30],
    error: [50, 100, 50, 100, 50]
};
