import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'error', onClose, duration = 3000, action }) => {
    const [animationState, setAnimationState] = useState<'entering' | 'visible' | 'leaving'>('entering');

    useEffect(() => {
        // Small delay to trigger enter animation
        const enterTimer = setTimeout(() => {
            setAnimationState('visible');
        }, 10);

        // Auto-dismiss timer
        const dismissTimer = setTimeout(() => {
            setAnimationState('leaving');
            setTimeout(onClose, 400); // Match the spring animation duration
        }, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(dismissTimer);
        };
    }, [duration, onClose]);

    const handleDismiss = () => {
        setAnimationState('leaving');
        setTimeout(onClose, 400);
    };

    const getTypeConfig = () => {
        switch (type) {
            case 'error':
                return {
                    icon: '⚠️',
                    accentColor: 'rgba(255, 59, 48, 0.8)',
                    iconBg: 'rgba(255, 59, 48, 0.15)'
                };
            case 'success':
                return {
                    icon: '✓',
                    accentColor: 'rgba(52, 199, 89, 0.8)',
                    iconBg: 'rgba(52, 199, 89, 0.15)'
                };
            case 'info':
                return {
                    icon: 'ℹ',
                    accentColor: 'rgba(0, 122, 255, 0.8)',
                    iconBg: 'rgba(0, 122, 255, 0.15)'
                };
            default:
                return {
                    icon: '⚠️',
                    accentColor: 'rgba(255, 59, 48, 0.8)',
                    iconBg: 'rgba(255, 59, 48, 0.15)'
                };
        }
    };

    const config = getTypeConfig();

    // iOS-style spring animation
    const getTransform = () => {
        switch (animationState) {
            case 'entering':
                return 'translateY(-120%) scale(0.9)';
            case 'visible':
                return 'translateY(0) scale(1)';
            case 'leaving':
                return 'translateY(-120%) scale(0.9)';
            default:
                return 'translateY(0) scale(1)';
        }
    };

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none"
            style={{
                paddingTop: 'max(12px, env(safe-area-inset-top))',
                paddingLeft: '12px',
                paddingRight: '12px'
            }}
        >
            <div
                className="pointer-events-auto w-full max-w-[400px]"
                style={{
                    transform: getTransform(),
                    opacity: animationState === 'entering' ? 0 : 1,
                    transition: animationState === 'leaving'
                        ? 'transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease-out'
                        : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
                }}
            >
                {/* iOS Notification Card */}
                <div
                    className="rounded-[20px] overflow-hidden shadow-2xl"
                    style={{
                        background: 'rgba(30, 30, 30, 0.75)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <div className="flex items-start gap-3 p-4">
                        {/* Icon */}
                        <div
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                            style={{
                                background: config.iconBg,
                                color: config.accentColor,
                                boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                            }}
                        >
                            {type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span>{config.icon}</span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p
                                className="text-[15px] font-medium leading-snug"
                                style={{
                                    color: 'rgba(255, 255, 255, 0.95)',
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                {message}
                            </p>

                            {/* Action Button */}
                            {action && (
                                <button
                                    onClick={() => {
                                        action.onClick();
                                        handleDismiss();
                                    }}
                                    className="mt-2 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                                    style={{
                                        background: config.accentColor,
                                        color: 'white',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                    }}
                                >
                                    {action.label}
                                </button>
                            )}
                        </div>

                        {/* Dismiss Button */}
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Subtle gradient accent at bottom */}
                    <div
                        className="h-[2px]"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${config.accentColor}, transparent)`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
