import React, { useEffect, useState } from 'react';
import type { ToastMessage } from '../../types';

interface ToastProps {
    messages: ToastMessage[];
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ messages, onClose, duration = 3000 }) => {
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

    // Determine the primary type (error > info > success) for accent color
    const getPrimaryType = (): 'error' | 'success' | 'info' => {
        if (messages.some(m => m.type === 'error')) return 'error';
        if (messages.some(m => m.type === 'info')) return 'info';
        return 'success';
    };

    const getTypeConfig = (type: 'error' | 'success' | 'info') => {
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

    // Get small inline icon for each message type
    const getSmallIcon = (type: 'error' | 'success' | 'info') => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return <span className="text-sm">⚠️</span>;
            case 'info':
                return <span className="text-sm">ℹ️</span>;
        }
    };

    const primaryType = getPrimaryType();
    const primaryConfig = getTypeConfig(primaryType);
    const isSingleMessage = messages.length === 1;

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
                    {/* Single Message Layout */}
                    {isSingleMessage && (
                        <div className="flex">
                            {/* Left dismiss pill */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDismiss();
                                }}
                                className="flex-shrink-0 w-8 flex items-center justify-center transition-all active:bg-white/10 rounded-l-[20px]"
                                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                            >
                                <div 
                                    className="w-1 h-8 rounded-full"
                                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                                />
                            </button>

                            {/* Main content - clickable for action */}
                            <div 
                                className={`flex-1 flex items-start gap-3 p-4 pl-2 ${messages[0].action ? 'cursor-pointer active:bg-white/5 transition-colors' : ''}`}
                                onClick={() => {
                                    if (messages[0].action) {
                                        messages[0].action.onClick();
                                        handleDismiss();
                                    }
                                }}
                            >
                                {/* Icon */}
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                                    style={{
                                        background: primaryConfig.iconBg,
                                        color: primaryConfig.accentColor,
                                        boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                                    }}
                                >
                                    {messages[0].type === 'success' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{primaryConfig.icon}</span>
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
                                        {messages[0].message}
                                    </p>

                                    {/* Tap hint for actionable toasts */}
                                    {messages[0].action && (
                                        <p className="mt-1 text-xs text-white/40">
                                            Tap to {messages[0].action.label.toLowerCase()} →
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!isSingleMessage && (
                        <div className="flex">
                            {/* Left dismiss pill */}
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 w-8 flex items-center justify-center transition-all active:bg-white/10 rounded-l-[20px]"
                                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                            >
                                <div 
                                    className="w-1 h-10 rounded-full"
                                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                                />
                            </button>

                            {/* Main content */}
                            <div className="flex-1 p-4 pl-2">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                                        style={{
                                            background: primaryConfig.iconBg,
                                            color: primaryConfig.accentColor
                                        }}
                                    >
                                        {messages.length}
                                    </div>
                                    <span className="text-xs font-medium text-white/50 uppercase tracking-wide">
                                        Notifications
                                    </span>
                                </div>

                            {/* Stacked Messages */}
                            <div className="space-y-2">
                                {messages.map((msg) => {
                                    const msgConfig = getTypeConfig(msg.type);
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl ${msg.action ? 'cursor-pointer active:bg-white/10 transition-colors' : ''}`}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)'
                                            }}
                                            onClick={() => {
                                                if (msg.action) {
                                                    msg.action.onClick();
                                                    handleDismiss();
                                                }
                                            }}
                                        >
                                            {/* Small type indicator */}
                                            <div
                                                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                                                style={{
                                                    background: msgConfig.iconBg,
                                                    color: msgConfig.accentColor
                                                }}
                                            >
                                                {getSmallIcon(msg.type)}
                                            </div>

                                            {/* Message + tap hint */}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-[14px] font-medium leading-tight"
                                                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                                >
                                                    {msg.message}
                                                </p>
                                                {msg.action && (
                                                    <p className="text-[11px] text-white/40 mt-0.5">
                                                        Tap to {msg.action.label.toLowerCase()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow indicator for actionable items */}
                                            {msg.action && (
                                                <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Subtle gradient accent at bottom */}
                    <div
                        className="h-[2px]"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${primaryConfig.accentColor}, transparent)`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
