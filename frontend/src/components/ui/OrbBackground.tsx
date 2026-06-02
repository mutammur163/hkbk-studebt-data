import { useEffect, useRef } from 'react';

interface OrbBackgroundProps {
  className?: string;
}

export default function OrbBackground({ className = '' }: OrbBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.3 + 0.05,
      });
    }

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / width,
        y: (e.clientY - rect.top) / height,
      };
    };

    window.addEventListener('resize', handleResize);
    canvas.parentElement?.addEventListener('mousemove', handleMouse);

    let time = 0;
    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Main orb glow
      const cx = width * (0.5 + Math.sin(time) * 0.1 + (mouseRef.current.x - 0.5) * 0.1);
      const cy = height * (0.5 + Math.cos(time * 0.7) * 0.1 + (mouseRef.current.y - 0.5) * 0.1);
      const orbR = Math.min(width, height) * 0.35;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
      grad.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
      grad.addColorStop(0.4, 'rgba(139, 92, 246, 0.06)');
      grad.addColorStop(0.7, 'rgba(167, 139, 250, 0.02)');
      grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Secondary orb
      const cx2 = width * (0.65 + Math.cos(time * 0.8) * 0.15);
      const cy2 = height * (0.4 + Math.sin(time * 0.6) * 0.12);
      const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, orbR * 0.6);
      grad2.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      grad2.addColorStop(1, 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <div className={`orb-container ${className}`}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
