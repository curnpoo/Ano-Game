import type { DrawingStroke } from "../types";

// Ramer-Douglas-Peucker algorithm for line simplification
export const simplifyPoints = (points: { x: number; y: number }[], tolerance: number): { x: number; y: number }[] => {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let index = 0;

    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], start, end);
        if (dist > maxDist) {
            maxDist = dist;
            index = i;
        }
    }

    if (maxDist > tolerance) {
        const left = simplifyPoints(points.slice(0, index + 1), tolerance);
        const right = simplifyPoints(points.slice(index), tolerance);
        return [...left.slice(0, left.length - 1), ...right];
    } else {
        return [start, end];
    }
};

const perpendicularDistance = (point: { x: number; y: number }, start: { x: number; y: number }, end: { x: number; y: number }): number => {
    let dx = end.x - start.x;
    let dy = end.y - start.y;

    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
        dx /= mag;
        dy /= mag;
    }

    // Cross product for 2D gives distance
    // |(p - start) x (end - start)| / |end - start|
    const num = Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x);
    const den = Math.sqrt((end.y - start.y) ** 2 + (end.x - start.x) ** 2);

    if (den === 0) return 0;
    return num / den;
};

export const simplifyStrokes = (strokes: DrawingStroke[], tolerance: number = 0.5): DrawingStroke[] => {
    return strokes.map(stroke => ({
        ...stroke,
        points: simplifyPoints(stroke.points, tolerance)
    }));
};
