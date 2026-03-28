'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  label?: string;
}

export default function Countdown({ targetDate, label }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prevTimeLeft, setPrevTimeLeft] = useState(timeLeft);

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calc());
    const id = setInterval(() => {
      setPrevTimeLeft(prev => prev);
      setTimeLeft(prev => {
        setPrevTimeLeft(prev);
        return calc();
      });
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, prev: prevTimeLeft.days, label: 'дн' },
    { value: timeLeft.hours, prev: prevTimeLeft.hours, label: 'час' },
    { value: timeLeft.minutes, prev: prevTimeLeft.minutes, label: 'мин' },
    { value: timeLeft.seconds, prev: prevTimeLeft.seconds, label: 'сек' },
  ];

  return (
    <div className="text-center">
      {label && (
        <p className="text-gold/80 text-sm font-body uppercase tracking-widest mb-4">{label}</p>
      )}
      <div className="flex items-center justify-center gap-3">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3">
            <div className="flip-card">
              <div className="flip-card-inner w-16 h-20 sm:w-20 sm:h-24 flex flex-col items-center justify-center">
                <span
                  className={`text-2xl sm:text-4xl font-heading font-bold text-gold transition-transform duration-300 ${
                    unit.value !== unit.prev ? 'animate-flip' : ''
                  }`}
                >
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-cream/50 text-[10px] sm:text-xs uppercase tracking-wider mt-1">
                  {unit.label}
                </span>
              </div>
            </div>
            {i < units.length - 1 && (
              <span className="text-gold/40 text-2xl font-light">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
