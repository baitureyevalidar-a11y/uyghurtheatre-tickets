'use client';

interface MarqueeBarProps {
  items: Array<{ title: string; date: string }>;
}

export default function MarqueeBar({ items }: MarqueeBarProps) {
  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="bg-darkBrown border-b border-gold/20 overflow-hidden">
      <div className="marquee-track py-2">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-8 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-medium">{item.title}</span>
            <span className="text-cream/40 text-xs">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
