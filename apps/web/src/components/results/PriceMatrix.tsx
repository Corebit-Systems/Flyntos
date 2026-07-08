'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';

function generateMatrix(baseDateStr: string, origin: string, destination: string) {
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
  if (isNaN(baseDate.getTime())) baseDate.setTime(Date.now());

  const seed = (origin + destination).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const days = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Realistic pseudo-random price generation based on seed and offset
    const variation = Math.sin(seed + i) * 100;
    const price = Math.round(200 + (seed % 100) + variation);
    
    days.push({
      date,
      dateString: date.toISOString().substring(0, 10),
      price: Math.max(50, price), 
      offset: i,
    });
  }

  const prices = days.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return { days, minPrice, maxPrice };
}

export function PriceMatrix({ origin, destination, departDate }: { origin: string, destination: string, departDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { days, minPrice, maxPrice } = useMemo(() => 
    generateMatrix(departDate, origin, destination), 
  [departDate, origin, destination]);

  const handleSelect = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // Update both just in case
    if (params.has('depart')) {
      params.set('depart', newDate);
    } else {
      params.set('departureDate', newDate);
    }
    router.push(`${pathname}?${params.toString()}`);

    // Open out gateway
    window.open(`http://localhost:4000/out/aviasales?from=${origin}&to=${destination}&date=${newDate}`, '_blank');
  };

  const formatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 z-10 relative">
      <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 pb-2 custom-scrollbar">
        {days.map((day) => {
          const isSelected = day.offset === 0;
          const isCheapest = day.price === minPrice;
          const isExpensive = day.price === maxPrice;

          return (
            <div
              key={day.dateString}
              onClick={() => handleSelect(day.dateString)}
              className={`
                shrink-0 w-28 md:w-auto flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border hover:border-blue-500/50 hover:bg-white/10 active:scale-[0.98] 
                ${isSelected 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'bg-white/5 border-white/10'
                }
              `}
            >
              <div className="text-xs text-neutral-400 capitalize mb-1 text-center font-medium">
                {formatter.format(day.date).replace('.', '')}
              </div>
              <div className={`
                text-lg font-bold
                ${isCheapest ? 'text-emerald-400' : isExpensive ? 'text-neutral-500' : 'text-white'}
              `}>
                {day.price} €
              </div>
              {isCheapest && (
                <div className="mt-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Best
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
