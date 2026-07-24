/**
 * Confetti Particles Utility (Zero External Dependencies)
 * Lightweight HTML5 Canvas particle emitter for celebration visual feedback.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
}

const PALETTE = [
  "#2563eb", // Primary Blue
  "#22c55e", // Success Green
  "#f59e0b", // Warm Amber
  "#3b82f6", // Sky Blue
  "#ec4899", // Pink
  "#8b5cf6", // Purple
];

export function triggerConfetti(options?: { count?: number; originY?: number }) {
  if (typeof window === "undefined") return;

  // Respect user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const count = options?.count ?? 60;
  const originY = options?.originY ?? 0.6;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const particles: Particle[] = [];
  const startX = width / 2;
  const startY = height * originY;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * 120 - 150) * (Math.PI / 180); // Upwards spread
    const speed = Math.random() * 12 + 6;
    particles.push({
      x: startX + (Math.random() * 100 - 50),
      y: startY,
      vx: Math.cos(angle) * speed + (Math.random() * 4 - 2),
      vy: Math.sin(angle) * speed,
      size: Math.random() * 7 + 4,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    });
  }

  const context = ctx;

  let animationFrameId: number;
  const startTime = Date.now();
  const maxDuration = 3000; // 3s auto cleanup

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed >= maxDuration || particles.every((p) => p.opacity <= 0)) {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
      return;
    }

    context.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.98; // Air resistance
      p.rotation += p.vRot;

      if (elapsed > 1800) {
        p.opacity = Math.max(0, p.opacity - 0.03);
      }

      context.save();
      context.globalAlpha = p.opacity;
      context.translate(p.x, p.y);
      context.rotate(p.rotation);
      context.fillStyle = p.color;
      context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      context.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}

