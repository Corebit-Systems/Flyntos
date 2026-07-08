'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '../../hooks/useWizard';
import { scenarios } from '@flyntos/config';

export function SearchForm({ locale, labels }: { locale: string; labels: any }) {
  const router = useRouter();
  const {
    step,
    setStep,
    steps,
  } = useWizard();

  const [fromCity, setFromCity] = useState('SOF');
  const [toCity, setToCity] = useState('MAD');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState('1');
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const [reverseActive, setReverseActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReverse = useCallback(() => {
    setReverseActive((prev) => !prev);
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  }, [fromCity, toCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Perform redirect via Next.js router.push with parameters
      const params = new URLSearchParams({
        origin: fromCity,
        destination: toCity,
        departureDate: departDate,
        returnDate: returnDate,
        adults: adults,
        scenario: selectedScenario,
      });
      router.push(`/${locale}/results?${params.toString()}`);
    }, 1500); // STROGY 1.5 seconds loading simulation
  };

  const scenarioOptions = Object.values(scenarios);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-10 px-4 text-center min-h-[220px]"
          >
            {/* Hypnotic Wave Flying Airplane SVG */}
            <div className="relative w-64 h-24 mb-4 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 100" fill="none">
                <path
                  d="M10,50 Q75,10 150,50 T290,50"
                  stroke="rgba(34, 211, 238, 0.15)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              </svg>

              <motion.div
                className="absolute w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                animate={{
                  x: [10, 75, 150, 225, 290],
                  y: [38, 8, 38, 68, 38],
                  rotate: [15, -15, 15, 15, -15],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full transform -rotate-45">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </motion.div>
            </div>

            <motion.h3
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-base font-semibold tracking-wider text-cyan-300 uppercase"
            >
              Ищем лучшие предложения...
            </motion.h3>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="search-form space-y-4"
          >
            {/* Step navigation tabs */}
            <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full w-fit">
              {steps.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                    step === s
                      ? 'bg-gradient-to-r from-teal-400 to-indigo-500 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Dense, single-row layout on desktop */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-2 bg-neutral-900/50 p-4 border border-white/5 rounded-2xl">
              {/* Origin */}
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{labels.from}</span>
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value.toUpperCase())}
                  placeholder="SOF"
                  required
                />
              </div>

              {/* Reversal button in-between */}
              <div className="flex items-center justify-center self-center lg:mb-1">
                <motion.button
                  type="button"
                  onClick={handleReverse}
                  className="p-2 bg-neutral-800 border border-white/10 hover:border-cyan-400 text-neutral-300 hover:text-cyan-400 rounded-full shadow-sm"
                  animate={{ rotate: reverseActive ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </motion.button>
              </div>

              {/* Destination */}
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{labels.to}</span>
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value.toUpperCase())}
                  placeholder="MAD"
                  required
                />
              </div>

              {/* Departure date */}
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{labels.depart}</span>
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  required
                />
              </div>

              {/* Return date */}
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{labels.return}</span>
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {/* Adults select */}
              <div className="min-w-[120px]">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Travelers</span>
                <select
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="w-full lg:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full lg:w-auto px-6 py-2 bg-gradient-to-r from-teal-400 to-indigo-500 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-cyan-500/10 transition-all duration-200"
                  type="submit"
                >
                  {labels.cta}
                </motion.button>
              </div>
            </div>

            {/* Scenario selections at the bottom */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Scenario Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {scenarioOptions.map((item) => (
                  <label key={item.type} className="cursor-pointer">
                    <input
                      checked={selectedScenario === item.type}
                      onChange={() => setSelectedScenario(item.type)}
                      type="radio"
                      name="scenario"
                      value={item.type}
                      className="sr-only peer"
                    />
                    <span className="px-3 py-1 border border-white/5 rounded-full text-[11px] font-medium text-neutral-400 bg-white/5 hover:bg-white/10 peer-checked:bg-gradient-to-r peer-checked:from-teal-400/10 peer-checked:to-indigo-500/10 peer-checked:border-cyan-400/40 peer-checked:text-cyan-300 transition-all duration-150">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
