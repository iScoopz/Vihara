'use client'

import { useEffect, useRef } from 'react';

// Nichiren (日蓮) means "sun lotus". As the visitor scrolls, the gold sun rises above
// layered aubergine horizons that move at different speeds. Disabled for reduced motion.
export function SunriseHero({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = root.offsetHeight || 1;
      const scrolled = Math.min(Math.max(window.scrollY, 0), height);
      root.style.setProperty('--s', String(scrolled));
      root.style.setProperty('--p', (scrolled / height).toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="sunrise relative isolate overflow-hidden bg-nav text-nav-ink min-h-[88svh] flex flex-col"
      style={{ '--s': 0, '--p': 0 } as React.CSSProperties}
    >
      {/* Sky: deepens toward the top, warms near the horizon. */}
      <div aria-hidden className="absolute inset-0 -z-30 bg-[linear-gradient(180deg,#140b20_0%,#26163a_45%,#4a2a4f_78%,#6b3a45_100%)]" />

      {/* Sun and its glow */}
      <div aria-hidden className="sunrise-sun absolute left-1/2 md:left-[76%] -bottom-[2%] md:bottom-[12%] -z-20 w-[min(80vw,420px)] md:w-[min(42vw,560px)] aspect-square">
        <div className="absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,rgba(245,196,94,0.42)_0%,rgba(245,196,94,0.12)_38%,transparent_68%)]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,#ffe7a8_0%,#f2c15a_45%,#d9952e_100%)] shadow-[0_0_80px_20px_rgba(242,193,90,0.25)]" />
      </div>

      {/* Horizon layers, far to near */}
      <svg aria-hidden className="sunrise-far absolute inset-x-0 bottom-[10%] -z-10 w-full h-[34%]" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#3d2350" d="M0 190 C 180 130, 330 150, 480 170 S 820 110, 980 140 S 1270 190, 1440 150 L1440 320 L0 320 Z" />
      </svg>
      <svg aria-hidden className="sunrise-mid absolute inset-x-0 bottom-[2%] -z-10 w-full h-[30%]" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#2e1a42" d="M0 210 C 220 160, 400 200, 620 185 S 980 150, 1180 190 S 1360 215, 1440 200 L1440 320 L0 320 Z" />
      </svg>
      <svg aria-hidden className="sunrise-near absolute inset-x-0 -bottom-px -z-10 w-full h-[22%]" viewBox="0 0 1440 240" preserveAspectRatio="none">
        <path fill="#1f1030" d="M0 150 C 260 110, 520 160, 760 140 S 1180 100, 1440 135 L1440 240 L0 240 Z" />
      </svg>

      <div className="sunrise-content relative flex-1 flex flex-col">{children}</div>

      <style>{`
        .sunrise-sun { transform: translate(-50%, calc(28% - var(--s) * 0.45px)); }
        .sunrise-far { transform: translateY(calc(var(--s) * 0.12px)); }
        .sunrise-mid { transform: translateY(calc(var(--s) * 0.06px)); }
        .sunrise-content { transform: translateY(calc(var(--s) * 0.22px)); opacity: calc(1 - var(--p) * 1.3); }
        .sunrise-sun, .sunrise-far, .sunrise-mid, .sunrise-content { will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .sunrise-sun { transform: translate(-50%, 10%); }
          .sunrise-far, .sunrise-mid, .sunrise-content { transform: none; opacity: 1; }
        }
      `}</style>
    </section>
  );
}
