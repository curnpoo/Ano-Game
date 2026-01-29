import { formatErrorMessage } from './errorHandler';

export type ToastEventDetail = {
    message: string;
    type?: 'error' | 'success' | 'info';
    action?: {
        label: string;
        onClick: () => void;
    };
};

const TOAST_EVENT = 'app:toast';

export const emitToast = (detail: ToastEventDetail): void => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<ToastEventDetail>(TOAST_EVENT, { detail }));
};

export const emitToastMessage = (
    message: string,
    type: 'error' | 'success' | 'info' = 'info',
    action?: ToastEventDetail['action']
): void => {
    emitToast({ message, type, action });
};

export const emitErrorToast = (error: any, fallbackMessage = 'Something went wrong'): void => {
    const message = error ? formatErrorMessage(error) : fallbackMessage;
    emitToastMessage(message, 'error');
};

export const addToastListener = (handler: (detail: ToastEventDetail) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    const listener = (event: Event) => {
        const { detail } = event as CustomEvent<ToastEventDetail>;
        if (!detail) return;
        handler(detail);
    };
    window.addEventListener(TOAST_EVENT, listener);
    return () => window.removeEventListener(TOAST_EVENT, listener);
};
