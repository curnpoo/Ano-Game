import React, { useEffect, useRef } from 'react';

interface ConfettiPiece {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
}

export const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const colors = ['#FF69B4', '#00D9FF', '#9B59B6', '#32CD32', '#FFE135', '#FF8C00'];
        const pieces: ConfettiPiece[] = [];

        // Determine explosion origin (center or bottom center)
        const originX = width / 2;
        const originY = height * 0.6;

        // Create confetti explosion
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 15 + 5;

            pieces.push({
                x: originX,
                y: originY,
                w: Math.random() * 10 + 5,
                h: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 10, // Initial upward burst
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        let animationFrame: number;

        const draw = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            let activeCount = 0;

            pieces.forEach((p) => {
                // Physics
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5; // Gravity
                p.vx *= 0.95; // Air resistance
                p.rotation += p.rotationSpeed;

                // Only draw if within reasonable bounds (including slightly oob)
                if (p.y < height + 100) {
                    activeCount++;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            });

            if (activeCount > 0) {
                animationFrame = requestAnimationFrame(draw);
            }
        };

        draw();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100]"
        />
    );
};
