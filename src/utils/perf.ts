import { useEffect, useRef } from 'react';

type PerfEventType =
    | 'mark'
    | 'measure'
    | 'payload'
    | 'render'
    | 'long-task'
    | 'fps-drop';

export type PerfTier = 'full' | 'reduced' | 'minimal';

export interface PerfEvent {
    type: PerfEventType;
    name: string;
    value?: number;
    detail?: Record<string, unknown>;
    ts: number;
}

declare global {
    interface Window {
        __ANO_PERF_EVENTS__?: PerfEvent[];
        __ANO_PERF_SUMMARY__?: () => PerfEvent[];
    }
}

const PERF_FLAG = 'ano_perf_debug';
const PERF_QUERY_KEYS = ['anoPerf', 'perf'];
const MAX_EVENTS = 250;

const now = () =>
    typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

const getWindow = () => (typeof window !== 'undefined' ? window : undefined);

export const isPerfDiagnosticsEnabled = (): boolean => {
    const win = getWindow();
    if (!win) return false;

    const params = new URLSearchParams(win.location.search);
    if (PERF_QUERY_KEYS.some((key) => params.get(key) === '1')) {
        return true;
    }

    try {
        return win.localStorage.getItem(PERF_FLAG) === '1';
    } catch {
        return false;
    }
};

export const setPerfDiagnosticsEnabled = (enabled: boolean) => {
    const win = getWindow();
    if (!win) return;

    try {
        win.localStorage.setItem(PERF_FLAG, enabled ? '1' : '0');
    } catch {
        // Ignore storage failures in private mode.
    }
};

const pushEvent = (event: PerfEvent) => {
    const win = getWindow();
    if (!win || !isPerfDiagnosticsEnabled()) return;

    const events = (win.__ANO_PERF_EVENTS__ ||= []);
    events.push(event);

    if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
    }

    win.__ANO_PERF_SUMMARY__ = () => [...events];

    const label = `[perf:${event.type}] ${event.name}`;
    if (event.value !== undefined) {
        console.debug(label, `${event.value.toFixed?.(2) ?? event.value}ms`, event.detail ?? {});
        return;
    }

    console.debug(label, event.detail ?? {});
};

export const perfMark = (name: string, detail?: Record<string, unknown>) => {
    pushEvent({
        type: 'mark',
        name,
        detail,
        ts: now(),
    });
};

export const perfMeasure = (
    name: string,
    start: number,
    detail?: Record<string, unknown>
) => {
    const duration = Math.max(0, now() - start);
    pushEvent({
        type: 'measure',
        name,
        value: duration,
        detail,
        ts: now(),
    });
    return duration;
};

export const perfPayload = (
    name: string,
    payload: unknown,
    detail?: Record<string, unknown>
) => {
    if (!isPerfDiagnosticsEnabled()) return 0;

    let size = 0;
    try {
        size = new TextEncoder().encode(JSON.stringify(payload)).length;
    } catch {
        size = 0;
    }

    pushEvent({
        type: 'payload',
        name,
        value: size,
        detail,
        ts: now(),
    });

    return size;
};

export const perfRender = (name: string, count: number, detail?: Record<string, unknown>) => {
    pushEvent({
        type: 'render',
        name,
        value: count,
        detail,
        ts: now(),
    });
};

export const perfLongTask = (name: string, duration: number, detail?: Record<string, unknown>) => {
    pushEvent({
        type: 'long-task',
        name,
        value: duration,
        detail,
        ts: now(),
    });
};

export const perfFrameDrop = (duration: number, detail?: Record<string, unknown>) => {
    pushEvent({
        type: 'fps-drop',
        name: 'frame',
        value: duration,
        detail,
        ts: now(),
    });
};

export const usePerfRenderCounter = (name: string, detail?: Record<string, unknown>) => {
    const renderCountRef = useRef(0);

    useEffect(() => {
        renderCountRef.current += 1;
        perfRender(name, renderCountRef.current, detail);
    });
};

export const usePerfLongTaskObserver = (scope: string) => {
    useEffect(() => {
        if (!isPerfDiagnosticsEnabled() || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            return;
        }

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                perfLongTask(`${scope}:long-task`, entry.duration);
            }
        });

        try {
            observer.observe({ entryTypes: ['longtask'] });
        } catch {
            observer.disconnect();
        }

        return () => observer.disconnect();
    }, [scope]);
};

export const usePerfFrameMonitor = (scope: string) => {
    useEffect(() => {
        if (!isPerfDiagnosticsEnabled() || typeof window === 'undefined') return;

        let rafId = 0;
        let previous = now();

        const tick = () => {
            const current = now();
            const delta = current - previous;
            previous = current;

            if (delta > 34) {
                perfFrameDrop(delta, { scope });
            }

            rafId = window.requestAnimationFrame(tick);
        };

        rafId = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(rafId);
    }, [scope]);
};
