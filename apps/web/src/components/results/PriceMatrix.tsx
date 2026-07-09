'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DayPrice {
  date: Date;
  dateString: string;
  price: number | null;
  offset: number;
}

function getBaseDates(baseDateStr: string) {
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
  if (isNaN(baseDate.getTime())) baseDate.setTime(Date.now());

  const days: DayPrice[] = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    days.push({
      date,
      dateString: date.toISOString().substring(0, 10),
      price: null,
      offset: i,
    });
  }
  return days;
}

export function PriceMatrix({ origin, destination, departDate }: { origin: string, destination: string, departDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const baseDays = useMemo(() => getBaseDates(departDate), [departDate]);
  
  const [days, setDays] = useState<DayPrice[]>(baseDays);
  const [isLoading, setIsLoading] = useState(true);

  const isUsd = origin.toUpperCase() === 'MOW' || destination.toUpperCase() === 'MOW';
  const currencySymbol = isUsd ? '$' : '€';

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    if (!origin || !destination || origin.length < 3 || destination.length < 3) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const params = new URLSearchParams({
      origin,
      destination,
      ...(departDate ? { depart_date: departDate } : {})
    });

    fetch(`${apiBase}/api/prices?${params.toString()}`)
      .then(res => res.json())
      .then((json: { data: Array<{ date: string; price: number | null }> }) => {
        if (!isMounted) return;

        // Map API days onto our 7-day baseDays window
        const priceMap: Record<string, number | null> = {};
        (json.data || []).forEach(d => { priceMap[d.date] = d.price; });

        const updatedDays = baseDays.map(day => ({
          ...day,
          price: priceMap[day.dateString] ?? null
        }));

        setDays(updatedDays);
      })
      .catch(() => {
        // On network error show nulls — no fakes
        if (isMounted) setDays(baseDays.map(d => ({ ...d, price: null })));
      })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [origin, destination, departDate, baseDays, apiBase]);

  const validPrices = days.map(d => d.price).filter((p): p is number => p !== null);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : -1;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : -1;

  const handleSelect = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has('depart')) {
      params.set('depart', newDate);
    } else {
      params.set('departureDate', newDate);
    }
    router.push(`${pathname}?${params.toString()}`);

    window.open(`${apiBase}/out/aviasales?from=${origin}&to=${destination}&date=${newDate}`, '_blank');
  };

  const locale = pathname?.split('/')[1] || 'en';
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 z-10 relative min-h-[100px]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 pb-2 custom-scrollbar"
          >
            {baseDays.map((day) => (
              <div key={day.dateString} className="shrink-0 w-28 md:w-auto p-3 rounded-xl border bg-white/5 border-white/10 animate-pulse flex flex-col items-center">
                <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
                <div className="h-6 w-12 bg-white/20 rounded"></div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 pb-2 custom-scrollbar"
          >
            {days.map((day) => {
              const isSelected = day.offset === 0;
              const hasPrice = day.price !== null;
              const isCheapest = hasPrice && day.price === minPrice;
              const isExpensive = hasPrice && day.price === maxPrice && validPrices.length > 1;

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
                    ${isCheapest ? 'text-emerald-400' : isExpensive ? 'text-neutral-500' : hasPrice ? 'text-white' : 'text-neutral-600'}
                  `}>
                    {hasPrice ? (currencySymbol === '$' ? '$' + day.price : day.price + ' €') : '--'}
                  </div>
                  {isCheapest && (
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      Best
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4 text-center text-[10px] text-neutral-500 uppercase tracking-wide">
        Цены основаны на недавних поисках и могут отличаться от текущих. Точная стоимость проверяется при клике.
      </div>
    </div>
  );
}
