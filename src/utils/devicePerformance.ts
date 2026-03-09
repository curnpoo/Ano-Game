import { useEffect, useMemo, useState } from 'react';

export type DevicePerformanceTier = 'full' | 'reduced' | 'minimal';

export interface DevicePerformanceProfile {
    tier: DevicePerformanceTier;
    prefersReducedMotion: boolean;
    disableHeavyBlur: boolean;
    disableAnimatedBackgrounds: boolean;
    disableFancyTransitions: boolean;
    disableGameplayEffects: boolean;
    toastBlurStrength: 'full' | 'reduced' | 'minimal';
}

const getMotionPreference = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const detectTier = (): DevicePerformanceTier => {
    if (typeof navigator === 'undefined') return 'full';

    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const reducedMotion = getMotionPreference();
    const ua = navigator.userAgent.toLowerCase();
    const isIPhone = /iphone/.test(ua);

    if (reducedMotion || memory <= 2 || cores <= 2) {
        return 'minimal';
    }

    if (memory <= 4 || cores <= 4 || isIPhone) {
        return 'reduced';
    }

    return 'full';
};

export const useDevicePerformance = () => {
    const [tier, setTier] = useState<DevicePerformanceTier>(() => detectTier());
    const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => getMotionPreference());

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = () => {
            setPrefersReducedMotion(media.matches);
            setTier(detectTier());
        };

        handleChange();
        media.addEventListener?.('change', handleChange);

        return () => media.removeEventListener?.('change', handleChange);
    }, []);

    return useMemo<DevicePerformanceProfile>(() => ({
        tier,
        prefersReducedMotion,
        disableHeavyBlur: tier !== 'full',
        disableAnimatedBackgrounds: tier !== 'full',
        disableFancyTransitions: tier !== 'full',
        disableGameplayEffects: tier === 'minimal',
        toastBlurStrength: tier === 'full' ? 'full' : tier === 'reduced' ? 'reduced' : 'minimal',
    }), [prefersReducedMotion, tier]);
};
