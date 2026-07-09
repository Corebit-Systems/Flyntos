'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../hooks/useWizard';
import { scenarios } from '@flyntos/config';
import { motion, AnimatePresence } from 'framer-motion';
import airportsData from '../../data/airports.json';

const enToRu: Record<string, string> = { 'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю' };
const ruToEn: Record<string, string> = Object.fromEntries(Object.entries(enToRu).map(([k, v]) => [v, k]));

function switchLayout(str: string) {
  return str.split('').map(c => enToRu[c.toLowerCase()] || ruToEn[c.toLowerCase()] || c).join('');
}

interface Airport {
  code: string;
  name_ru: string;
  name_en: string;
  city_ru: string;
  city_en: string;
  country_ru: string;
}

const AIRPORTS = airportsData as Airport[];

function scoreAirport(airport: Airport, query: string, altQuery: string): number {
  const q = query.trim().toLowerCase();
  const alt = altQuery.trim().toLowerCase();
  if (!q) return 0;

  let s = 0;
  const isExactCode = airport.code.toLowerCase() === q || airport.code.toLowerCase() === alt;
  const isExactName = airport.name_en?.toLowerCase() === q || airport.name_ru?.toLowerCase() === q || airport.name_en?.toLowerCase() === alt || airport.name_ru?.toLowerCase() === alt;
  const isExactCity = airport.city_en?.toLowerCase() === q || airport.city_ru?.toLowerCase() === q || airport.city_en?.toLowerCase() === alt || airport.city_ru?.toLowerCase() === alt;
  
  const isNameStarts = airport.name_en?.toLowerCase().startsWith(q) || airport.name_ru?.toLowerCase().startsWith(q) || airport.name_en?.toLowerCase().startsWith(alt) || airport.name_ru?.toLowerCase().startsWith(alt);
  const isCityStarts = airport.city_en?.toLowerCase().startsWith(q) || airport.city_ru?.toLowerCase().startsWith(q) || airport.city_en?.toLowerCase().startsWith(alt) || airport.city_ru?.toLowerCase().startsWith(alt);
  const isCodeStarts = airport.code.toLowerCase().startsWith(q) || airport.code.toLowerCase().startsWith(alt);

  if (isExactCode) s += 10000;
  else if (isExactName) s += 5000;
  else if (isExactCity) s += 4000;
  else if (isNameStarts) s += 3000;
  else if (isCityStarts) s += 2000;
  else if (isCodeStarts) s += 1000;

  const target = `${airport.code} ${airport.name_ru} ${airport.name_en} ${airport.city_ru} ${airport.city_en}`.toLowerCase();
  if (target.includes(q) || target.includes(alt)) {
    s += 100;
  }

  // Hub heuristic: If the airport name exactly matches its city name, it's a major hub/city pseudo-code
  if ((airport.name_en && airport.city_en && airport.name_en === airport.city_en) || 
      (airport.name_ru && airport.city_ru && airport.name_ru === airport.city_ru)) {
    s += 500;
  }

  return s;
}

function CityAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  label,
  locale 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string, 
  label: string,
  locale: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  // displayValue shows city name after selection, raw code while typing
  const [displayValue, setDisplayValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync display if parent resets value (e.g. swap)
  useEffect(() => {
    if (!value) { setDisplayValue(''); return; }
    // If value is an IATA code, try to show city name
    const airport = AIRPORTS.find(a => a.code === value.toUpperCase());
    const isRu = locale === 'ru' || locale === 'uk' || locale === 'be' || locale === 'kk';
    setDisplayValue(airport ? (isRu ? (airport.city_ru || airport.name_ru || airport.city_en) : (airport.city_en || airport.name_en || airport.city_ru)) : value);
  }, [value, locale]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = displayValue.toLowerCase();
  const altQuery = switchLayout(query);

  const results = !query || query.length < 1 ? [] : AIRPORTS.filter(a => {
    const target = `${a.code} ${a.name_ru} ${a.name_en} ${a.city_ru} ${a.city_en}`.toLowerCase();
    return target.includes(query) || target.includes(altQuery);
  }).sort((a, b) => {
    return scoreAirport(b, query, altQuery) - scoreAirport(a, query, altQuery) || (a.city_en || '').localeCompare(b.city_en || '');
  }).slice(0, 8);

  return (
    <div className="flex flex-col flex-1 min-w-[120px] relative" ref={wrapperRef}>
      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{label}</label>
      <input
        className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
        value={displayValue}
        onChange={(e) => {
          setDisplayValue(e.target.value);
          onChange(e.target.value.toUpperCase());
          setIsOpen(true);
        }}
        onFocus={() => {
          if (displayValue) setIsOpen(true);
        }}
        placeholder={placeholder}
        required
      />

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl custom-scrollbar"
          >
            {results.map((item) => {
              const isRu = locale === 'ru' || locale === 'uk' || locale === 'be' || locale === 'kk';
              const displayName = isRu ? (item.city_ru || item.name_ru || item.city_en) : (item.city_en || item.name_en || item.city_ru);
              
              return (
                <div
                  key={item.code}
                  onClick={() => {
                    onChange(item.code);
                    setDisplayValue(displayName);
                    setIsOpen(false);
                  }}
                  className="hover:bg-blue-600/20 px-4 py-3 transition-all flex justify-between items-center cursor-pointer text-sm border-b border-white/5 last:border-none"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-white font-medium">{displayName}</span>
                    <span className="text-neutral-400 text-xs">{item.country_ru}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded shrink-0 ml-2">
                    {item.code}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SearchForm({ 
  locale, 
  labels,
  initialOrigin = '',
  initialDestination = ''
}: { 
  locale: string; 
  labels?: any;
  initialOrigin?: string;
  initialDestination?: string;
}) {
  const router = useRouter();
  const { step, setStep, steps } = useWizard();

  const [fromCity, setFromCity] = useState(initialOrigin);
  const [toCity, setToCity] = useState(initialDestination);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);

  const [departFocused, setDepartFocused] = useState(false);
  const [returnFocused, setReturnFocused] = useState(false);

  const datePattern = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date(2000, 11, 31));
      return parts.map(p => {
        if (p.type === 'day') return 'DD';
        if (p.type === 'month') return 'MM';
        if (p.type === 'year') return 'YYYY';
        return p.value;
      }).join('');
    } catch {
      return 'DD.MM.YYYY';
    }
  }, [locale]);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return '';
    try {
      // Force 2-digit to prevent "9/1/2026" instead of "01.09.2026"
      return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }, [locale]);

  useEffect(() => {
    async function detectLocation() {
      if (initialOrigin) return; // Skip if already set
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const cityEn = data.city;
          if (cityEn) {
            const airport = AIRPORTS.find(a => 
              a.city_en?.toLowerCase() === cityEn.toLowerCase() || 
              a.city_ru?.toLowerCase() === cityEn.toLowerCase()
            );
            if (airport) {
              setFromCity(airport.code);
            }
          }
        }
      } catch (err) {
        // ignore and leave empty
      }
    }
    detectLocation();
  }, [initialOrigin]);

  const handleReverse = useCallback(() => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  }, [fromCity, toCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const resolveCode = (input: string): string => {
      const query = input.trim().toLowerCase();
      if (!query) return '';
      const altQuery = switchLayout(query);

      let bestMatch: Airport | null = null;
      let highestScore = 0;

      for (const airport of AIRPORTS) {
        const score = scoreAirport(airport, query, altQuery);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = airport;
        }
      }

      if (bestMatch && highestScore > 0) {
        console.log('===> RESOLVED DYNAMICALLY:', bestMatch.code, '| Score:', highestScore, '| for input:', input);
        return bestMatch.code;
      }
      // 6. Last resort: substring includes
      const fallback = AIRPORTS.find(a => {
        const target = `${a.code} ${a.name_ru} ${a.name_en} ${a.city_ru} ${a.city_en}`.toLowerCase();
        return target.includes(query) || target.includes(altQuery);
      });
      if (fallback) {
        console.log('===> RESOLVED (fallback substring):', fallback.code, 'for input:', query);
        return fallback.code;
      }

      console.log('===> RESOLVED (raw input as-is):', input.toUpperCase());
      return input.toUpperCase();
    };

    const finalFrom = resolveCode(fromCity);
    const finalTo = resolveCode(toCity);

    setTimeout(() => {
      const params = new URLSearchParams({
        origin: finalFrom,
        destination: finalTo,
        departDate: departDate,
      });
      if (returnDate) params.set('returnDate', returnDate);
      params.set('adults', adults);
      params.set('children', children);
      params.set('scenario', selectedScenario);
      router.push(`/${locale}/results?${params.toString()}`);
    }, 1500);
  };

  const scenarioOptions = Object.values(scenarios);

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl mx-auto bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center shadow-2xl relative z-10 min-h-[200px]"
          >
            {/* Airplane Animation SVG */}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-12 h-12 text-blue-500 mb-6"
              initial={{ x: -50, y: 50, opacity: 0 }}
              animate={{ x: 50, y: -50, opacity: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </motion.svg>
            <h3 className="text-lg font-bold text-white tracking-widest uppercase animate-pulse">
              Ищем лучшие маршруты...
            </h3>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {/* Step navigation tabs */}
            <div className="flex gap-4 px-2 w-fit mb-4">
              {steps.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className={`text-sm font-semibold uppercase tracking-widest pb-2 border-b-2 transition-all duration-200 ${
                    step === s
                      ? 'border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch gap-3 shadow-2xl relative z-10">
              
              <CityAutocomplete 
                label={labels?.from || 'From'}
                placeholder=""
                value={fromCity}
                onChange={setFromCity}
                locale={locale}
              />

              {/* Reversal Button */}
              <div className="flex items-center justify-center md:self-end pb-1.5 px-1">
                <button
                  type="button"
                  onClick={handleReverse}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-full transition-all border border-white/5"
                  title="Swap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </button>
              </div>

              <CityAutocomplete 
                label={labels?.to || 'To'}
                placeholder=""
                value={toCity}
                onChange={setToCity}
                locale={locale}
              />

              {/* Departure Date */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{labels?.depart || 'Depart'}</label>
                <div className="relative w-full">
                  <input
                    className={`w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono z-20 relative cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!departFocused && departDate ? 'text-transparent' : 'text-white'}`}
                    type="date"
                    value={departDate}
                    onFocus={() => setDepartFocused(true)}
                    onBlur={() => setDepartFocused(false)}
                    onChange={(e) => setDepartDate(e.target.value)}
                    required
                  />
                  {!departFocused && departDate && (
                    <div className="absolute inset-0 px-4 py-3 pointer-events-none flex items-center z-30 text-white text-sm font-semibold font-mono bg-neutral-950 rounded-xl">
                      {formatDate(departDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Return Date */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{labels?.return || 'Return'}</label>
                <div className="relative w-full">
                  <input
                    className={`w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono z-20 relative cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!returnFocused && returnDate ? 'text-transparent' : 'text-white'}`}
                    type="date"
                    value={returnDate}
                    onFocus={() => setReturnFocused(true)}
                    onBlur={() => setReturnFocused(false)}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                  {!returnFocused && returnDate && (
                    <div className="absolute inset-0 px-4 py-3 pointer-events-none flex items-center z-30 text-white text-sm font-semibold font-mono bg-neutral-950 rounded-xl">
                      {formatDate(returnDate)}
                    </div>
                  )}
                  {returnDate && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-full z-40 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setReturnDate('');
                      }}
                      title="Clear (One-way)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Adults */}
              <div className="flex flex-col flex-1 min-w-[90px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">Adults</label>
                <select
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              {/* Children */}
              <div className="flex flex-col flex-1 min-w-[90px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">Children</label>
                <select
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="md:self-end bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] whitespace-nowrap shadow-lg shadow-blue-500/10 cursor-pointer h-[46px]"
              >
                {labels?.cta || 'Искать рейсы'}
              </button>
            </form>

            {/* Scenarios */}
            <div className="flex flex-wrap items-center gap-2 mt-4 px-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-2">Presets</span>
              {scenarioOptions.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedScenario(item.type)}
                  className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all border ${
                    selectedScenario === item.type
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
