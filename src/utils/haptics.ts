let lastLightHapticAt = 0;

export const vibrate = (pattern: number | number[] = 10) => {
    // Check for support
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            const current = Date.now();
            if (typeof pattern === 'number' && current - lastLightHapticAt < 80) {
                return;
            }
            lastLightHapticAt = current;
            navigator.vibrate(pattern);
        } catch {
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
