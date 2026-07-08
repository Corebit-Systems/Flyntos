'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../hooks/useWizard';
import { scenarios } from '@flyntos/config';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchForm({ locale, labels }: { locale: string; labels: any }) {
  const router = useRouter();
  const { step, setStep, steps } = useWizard();

  const [fromCity, setFromCity] = useState('SOF');
  const [toCity, setToCity] = useState('MAD');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState('1');
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);

  const handleReverse = useCallback(() => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  }, [fromCity, toCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const params = new URLSearchParams({
        origin: fromCity,
        destination: toCity,
        departureDate: departDate,
        returnDate: returnDate,
        adults: adults,
        scenario: selectedScenario,
      });
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
              {/* Origin */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{labels?.from || 'From'}</label>
                <input
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value.toUpperCase())}
                  placeholder="SOF"
                  required
                />
              </div>

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

              {/* Destination */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{labels?.to || 'To'}</label>
                <input
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value.toUpperCase())}
                  placeholder="MAD"
                  required
                />
              </div>

              {/* Departure Date */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{labels?.depart || 'Depart'}</label>
                <input
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  required
                />
              </div>

              {/* Return Date */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">{labels?.return || 'Return'}</label>
                <input
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {/* Adults */}
              <div className="flex flex-col flex-1 min-w-[100px]">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">Travelers</label>
                <select
                  className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
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
