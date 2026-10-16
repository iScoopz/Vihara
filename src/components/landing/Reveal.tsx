'use client'

import { useEffect, useRef, useState } from 'react';

// Fades a section in once when it scrolls into view, so the page unfolds in reading order.
// Content is visible from the start without JavaScript and for reduced motion.
export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'static' | 'hidden' | 'shown'>('static');

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState('hidden');
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${state === 'hidden' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} transition-[opacity,transform] duration-700 ease-out`}
      style={{ transitionDelay: state === 'shown' ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
