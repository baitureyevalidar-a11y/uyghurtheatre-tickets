'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

interface Review {
  name: string;
  text: string;
  rating: number;
  date: string;
}

const reviews: Review[] = [
  {
    name: 'Айгүл Мәмбетова',
    text: 'Потрясающий спектакль! Актёры играют с такой душой, что невозможно оторвать глаз. Обязательно вернусь снова. Театр — настоящая жемчужина Алматы!',
    rating: 5,
    date: '15.02.2026',
  },
  {
    name: 'Нұрлан Бекмұратов',
    text: 'Жена подарила билеты на день рождения — это был лучший подарок! Уйгурский театр невероятно атмосферный, а музыка просто завораживает.',
    rating: 5,
    date: '28.01.2026',
  },
  {
    name: 'Абдуллах Турсунов',
    text: 'Как уйгур, горжусь тем, что у нас есть такой театр. Каждый спектакль — это праздник нашей культуры. Спасибо артистам за их труд!',
    rating: 5,
    date: '10.03.2026',
  },
  {
    name: 'Дана Қасымова',
    text: 'Впервые побывала в Уйгурском театре и была приятно удивлена. Прекрасная постановка, красивые костюмы и замечательная игра актёров.',
    rating: 4,
    date: '05.12.2025',
  },
  {
    name: 'Рустам Хәсәнов',
    text: 'Ходим всей семьёй уже много лет. Детям особенно нравятся музыкальные комедии. Удобно что теперь можно купить билеты онлайн!',
    rating: 5,
    date: '20.02.2026',
  },
];

export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % reviews.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, []);

  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoplay, next]);

  const review = reviews[current];

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      {/* Quote icon */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Quote className="w-6 h-6 text-gold" />
        </div>
      </div>

      {/* Review text */}
      <div className="text-center min-h-[140px] flex flex-col items-center justify-center">
        <p className="text-lg sm:text-xl text-cream/80 font-body leading-relaxed italic mb-6 px-4">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Stars */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-cream/20'}`}
            />
          ))}
        </div>

        {/* Name */}
        <p className="font-heading font-bold text-gold text-sm">{review.name}</p>
        <p className="text-cream/30 text-xs mt-1">{review.date}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-gold' : 'w-2 bg-cream/20 hover:bg-cream/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
