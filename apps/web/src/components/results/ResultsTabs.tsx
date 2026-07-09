'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface ResultsTabsProps {
  dict?: any;
}

export function ResultsTabs({ dict }: ResultsTabsProps) {
  const [currentTab, setCurrentTab] = useState<'cars' | 'extras'>('cars');
  const searchParams = useSearchParams();

  const originCity = (searchParams.get('origin') || searchParams.get('from') || '').toUpperCase();
  const destinationCity = (searchParams.get('destination') || searchParams.get('to') || '').toUpperCase();
  const departDate = searchParams.get('departureDate') || searchParams.get('depart') || searchParams.get('date') || '';
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

  const rp = dict?.ui?.resultsPage || {
    carsTitle: 'Car Rental & Charter',
    extrasTitle: 'Extras',
    airportTransport: 'Transport at airport {city}',
    transportSubtitle: 'Book a car or yacht at your point of arrival',
    cars: {
      optimalTitle: 'Optimal Crossover',
      optimalDesc: 'Optimal choice for comfortable travel along coastlines and mountain switchbacks.',
      optimalPrice: 'from 35 € / day',
      optimalBtn: 'Rent a car in {city}',
      budgetTitle: 'Budget Hatchback',
      budgetDesc: 'Ideal for narrow streets of historic towns and easy parking.',
      budgetPrice: 'from 18 € / day',
      budgetBtn: 'Rent a car in {city}',
      yachtTitle: 'Sailing Catamaran',
      yachtDesc: 'Premium charter. Available bareboat or crewed - worldwide marinas.',
      yachtPrice: 'from 250 € / day',
      yachtBtn: 'Charter from {city}'
    },
    extras: {
      transferTitle: 'Comfortable Transfer',
      transferDesc: 'Airport and station transfers with a meet-and-greet sign worldwide.',
      transferBtn: 'KiwiTaxi',
      excursionsTitle: 'Tours & Activities',
      excursionsDesc: 'Tickets to attractions and tours worldwide.',
      excursionsBtn: 'Klook',
      esimTitle: 'Mobile Internet eSIM',
      esimDesc: 'Connect to internet in 1 minute without physical SIM cards.',
      esimBtn: 'Saily',
      compensationTitle: 'Flight Compensation',
      compensationDesc: 'Claim up to 600 € for delayed or cancelled flights.',
      compensationBtn: 'Compensair'
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 relative z-10">
      
      {/* Tabs Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 relative">
          {['cars', 'extras'].map((tab) => {
            const isActive = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab as 'cars' | 'extras')}
                className={`
                  relative px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all z-10
                  ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {tab === 'cars' ? rp.carsTitle : rp.extrasTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {currentTab === 'cars' && (
            <motion.div
              key="cars"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* Section header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">
                  {rp.airportTransport.includes('{city}') ? (
                    <>
                      {rp.airportTransport.split('{city}')[0]}
                      <span className="text-blue-400">{destinationCity || '...'}</span>
                      {rp.airportTransport.split('{city}')[1]}
                    </>
                  ) : (
                    rp.airportTransport
                  )}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">{rp.transportSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Car 1 */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl">
                  <div>
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-xl mb-4" 
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80')" }}
                    />
                    <h4 className="text-lg font-bold text-white mb-2">Compact SUV</h4>
                    <p className="text-xs font-bold text-neutral-300 mb-2">Nissan Qashqai / Kia Sportage</p>
                    <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{rp.cars.optimalDesc}</p>
                    <div className="text-xl font-bold text-emerald-400 mb-6">{rp.cars.optimalPrice}</div>
                  </div>
                  <a href={`${apiBase}/out/autoeurope?from=${originCity}&to=${destinationCity}&date=${departDate}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.cars.optimalBtn.replace('{city}', destinationCity)}
                  </a>
                </div>

                {/* Car 2 */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl">
                  <div>
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-xl mb-4" 
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80')" }}
                    />
                    <h4 className="text-lg font-bold text-white mb-2">{rp.cars.budgetTitle}</h4>
                    <p className="text-xs font-bold text-neutral-300 mb-2">Fiat 500 / Hyundai i20</p>
                    <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{rp.cars.budgetDesc}</p>
                    <div className="text-xl font-bold text-emerald-400 mb-6">{rp.cars.budgetPrice}</div>
                  </div>
                  <a href={`${apiBase}/out/autoeurope?from=${originCity}&to=${destinationCity}&date=${departDate}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.cars.budgetBtn.replace('{city}', destinationCity)}
                  </a>
                </div>

                {/* Yacht 1 */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl">
                  <div>
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-xl mb-4" 
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80')" }}
                    />
                    <h4 className="text-lg font-bold text-white mb-2">{rp.cars.yachtTitle}</h4>
                    <p className="text-xs font-bold text-neutral-300 mb-2">Lagoon 40 / Dufour 460</p>
                    <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{rp.cars.yachtDesc}</p>
                    <div className="text-xl font-bold text-emerald-400 mb-6">{rp.cars.yachtPrice}</div>
                  </div>
                  <a href={`${apiBase}/out/searadar?from=${originCity}&to=${destinationCity}&date=${departDate}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.cars.yachtBtn.replace('{city}', destinationCity)}
                  </a>
                </div>

              </div>

            </motion.div>
          )}

          {currentTab === 'extras' && (
            <motion.div
              key="extras"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* KiwiTaxi */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{rp.extras.transferTitle}</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      {rp.extras.transferDesc}
                    </p>
                  </div>
                  <a href={`${apiBase}/out/kiwitaxi`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.extras.transferBtn}
                  </a>
                </div>

                {/* Klook */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{rp.extras.excursionsTitle}</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      {rp.extras.excursionsDesc}
                    </p>
                  </div>
                  <a href={`${apiBase}/out/klook`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.extras.excursionsBtn}
                  </a>
                </div>

                {/* Saily */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{rp.extras.esimTitle}</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      {rp.extras.esimDesc}
                    </p>
                  </div>
                  <a href={`${apiBase}/out/saily`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.extras.esimBtn}
                  </a>
                </div>

                {/* Compensair */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{rp.extras.compensationTitle}</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      {rp.extras.compensationDesc}
                    </p>
                  </div>
                  <a href={`${apiBase}/out/compensair`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    {rp.extras.compensationBtn}
                  </a>
                </div>

              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
