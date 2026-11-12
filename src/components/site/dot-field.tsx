"use client";

import { useEffect, useRef } from "react";
import { motionEnabled } from "@/components/motion/gsap";

const SPACING = 30;
const RADIUS = 160;
const PUSH = 26;

/**
 * Matriz de puntos en canvas que se aparta del cursor y se tiñe de acento.
 * Se pausa fuera de pantalla; con movimiento reducido se dibuja una vez, estática.
 */
export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const animated = motionEnabled() && window.matchMedia("(pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let points: { x: number; y: number; ox: number; oy: number }[] = [];
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let raf = 0;
    let running = false;
    let frame = 0;
    let accent = "#d4ff3a";
    let base = "#45433e";

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      accent = styles.getPropertyValue("--signal").trim() || accent;
      base = styles.getPropertyValue("--line-focus").trim() || base;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = [];
      const offsetX = (width % SPACING) / 2;
      const offsetY = (height % SPACING) / 2;
      for (let y = offsetY; y <= height; y += SPACING) {
        for (let x = offsetX; x <= width; x += SPACING) points.push({ x, y, ox: x, oy: y });
      }
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      for (const p of points) {
        const dx = p.ox - pointer.x;
        const dy = p.oy - pointer.y;
        const dist = Math.hypot(dx, dy);
        const force = dist < RADIUS ? (1 - dist / RADIUS) ** 2 : 0;
        const tx = p.ox + (dist > 0 ? (dx / dist) * force * PUSH : 0);
        const ty = p.oy + (dist > 0 ? (dy / dist) * force * PUSH : 0);
        p.x += (tx - p.x) * 0.18;
        p.y += (ty - p.y) * 0.18;
        const size = 1.2 + force * 2.2;
        ctx.fillStyle = force > 0.05 ? accent : base;
        ctx.globalAlpha = 0.45 + force * 0.55;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (++frame % 30 === 0) readColors();
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || !animated) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.tx = -9999;
      pointer.ty = -9999;
    };

    readColors();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);
    if (animated) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
