import React, { useEffect, useMemo, useState } from 'react';
import type { DevicePerformanceTier } from '../../utils/devicePerformance';
import { isPerfDiagnosticsEnabled, type PerfEvent } from '../../utils/perf';

interface PerfDiagnosticsOverlayProps {
    tier: DevicePerformanceTier;
}

const getEvents = (): PerfEvent[] => {
    if (typeof window === 'undefined') return [];
    return window.__ANO_PERF_SUMMARY__?.() || window.__ANO_PERF_EVENTS__ || [];
};

export const PerfDiagnosticsOverlay: React.FC<PerfDiagnosticsOverlayProps> = ({ tier }) => {
    const [events, setEvents] = useState<PerfEvent[]>(() => getEvents());

    useEffect(() => {
        if (!isPerfDiagnosticsEnabled()) return;

        const interval = window.setInterval(() => {
            setEvents(getEvents());
        }, 600);

        return () => window.clearInterval(interval);
    }, []);

    const summary = useMemo(() => {
        const recent = events.slice(-8).reverse();
        const lastLongTask = recent.find((event) => event.type === 'long-task' || event.type === 'fps-drop');
        const lastRoomPayload = [...events].reverse().find((event) => event.name === 'room.snapshot.bytes');

        return {
            recent,
            lastLongTask,
            lastRoomPayload,
        };
    }, [events]);

    if (!isPerfDiagnosticsEnabled()) return null;

    return (
        <div
            className="fixed bottom-3 right-3 z-[4000] w-[280px] rounded-2xl border border-lime-400/30 bg-black/85 text-white shadow-2xl"
            style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-300">Perf Debug</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">{tier}</span>
            </div>

            <div className="space-y-2 px-3 py-3 text-[11px]">
                <div className="flex items-center justify-between">
                    <span className="text-white/55">Events</span>
                    <span className="font-bold">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-white/55">Last room payload</span>
                    <span className="font-bold">
                        {summary.lastRoomPayload?.value ? `${Math.round(summary.lastRoomPayload.value / 1024)} KB` : 'n/a'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-white/55">Last spike</span>
                    <span className={`font-bold ${summary.lastLongTask ? 'text-yellow-300' : 'text-white/55'}`}>
                        {summary.lastLongTask?.value ? `${Math.round(summary.lastLongTask.value)} ms` : 'none'}
                    </span>
                </div>

                <div className="rounded-xl bg-white/5 p-2">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Recent</div>
                    <div className="space-y-1">
                        {summary.recent.length === 0 && (
                            <div className="text-white/35">No events yet</div>
                        )}
                        {summary.recent.map((event, index) => (
                            <div key={`${event.name}-${event.ts}-${index}`} className="flex items-center justify-between gap-2">
                                <span className="truncate text-white/70">
                                    {event.type}:{event.name}
                                </span>
                                <span className="flex-shrink-0 font-mono text-[10px] text-white/45">
                                    {event.value !== undefined ? Math.round(event.value).toString() : '-'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
