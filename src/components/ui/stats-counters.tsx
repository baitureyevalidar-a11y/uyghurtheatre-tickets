'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [started, target, duration]);

  return (
    <div ref={ref}>
      <span className="font-heading text-5xl sm:text-6xl font-bold text-gold">
        {prefix}{count.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

interface StatItem {
  target: number;
  suffix?: string;
  label: string;
  sublabel: string;
}

export default function StatsCounters({ stats, locale }: { stats: StatItem[]; locale: string }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center p-8 rounded-2xl border border-gold/10 bg-white/5">
          <AnimatedCounter target={stat.target} suffix={stat.suffix} />
          <p className="text-sm font-semibold text-cream/80 mt-3">{stat.label}</p>
          <p className="text-xs text-cream/40 mt-1">{stat.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
