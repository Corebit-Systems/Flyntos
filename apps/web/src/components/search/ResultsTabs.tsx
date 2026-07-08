'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TRAVEL_PARTNERS } from '@flyntos/config';

interface ResultsTabsProps {
  flightsContent: React.ReactNode;
  sidebarContent: React.ReactNode;
  origin: string;
  destination: string;
}

export function ResultsTabs({ flightsContent, sidebarContent, origin, destination }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<'flights' | 'cars' | 'extras'>('flights');

  // Filter partners based on their category
  const carsPartners = [
    { ...TRAVEL_PARTNERS.autoeurope, name: 'AutoEurope', desc: 'Global Car Rental Aggregator', tag: 'Car Rental' },
    { ...TRAVEL_PARTNERS.searadar, name: 'SEARADAR', desc: 'Premium Yacht & Boat Charter Worldwide', tag: 'Yacht Charter' }
  ];

  const extrasPartners = [
    { ...TRAVEL_PARTNERS.kiwitaxi, name: 'Kiwitaxi', desc: 'Professional Airport Transfers & Cabs', tag: 'Transfer' },
    { ...TRAVEL_PARTNERS.kkday, name: 'KKday', desc: 'Local Tours, Attractions & Activities', tag: 'Experiences' },
    { ...TRAVEL_PARTNERS.saily, name: 'Saily', desc: 'Global eSIM Data Packages for Travelers', tag: 'eSIM Data' },
    { ...TRAVEL_PARTNERS.radicalstorage, name: 'Radical Storage', desc: 'Luggage Storage Network in City Centers', tag: 'Baggage' },
    { ...TRAVEL_PARTNERS.compensair, name: 'Compensair', desc: 'Flight Delay & Cancellation Compensation', tag: 'Insurance' }
  ];

  const handlePartnerRedirect = (partnerId: string) => {
    // Lead to our secure API redirect endpoint
    window.open(`http://localhost:4000/out/${partnerId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Premium Fintech Style Tabs */}
      <div className="flex border-b border-white/10 pb-px">
        <div className="flex gap-4">
          {(['flights', 'cars', 'extras'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative py-3 px-1 text-sm font-semibold tracking-wider uppercase transition-colors duration-200 focus:outline-none"
            >
              <span className={activeTab === tab ? 'text-cyan-400' : 'text-neutral-400 hover:text-white'}>
                {tab === 'flights' ? '✈️ Flights' : tab === 'cars' ? '🚗 Cars & Yacht' : '🧩 Extras & Tours'}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-indigo-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-9 order-1 lg:order-2">
          {activeTab === 'flights' && flightsContent}

          {activeTab === 'cars' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {carsPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-6 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-between h-48 hover:border-cyan-400/40 transition-all duration-300 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-400/10 px-2.5 py-1 rounded-full">
                        {partner.tag}
                      </span>
                      <span className="text-[10px] text-neutral-500">ID: {partner.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{partner.name}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{partner.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-neutral-500">Redirect via apps/api</span>
                    <button
                      onClick={() => handlePartnerRedirect(partner.id)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-gradient-to-r hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition-all duration-300"
                    >
                      Забронировать
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'extras' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {extrasPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-between h-48 hover:border-cyan-400/40 transition-all duration-300 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 rounded-full">
                        {partner.tag}
                      </span>
                      <span className="text-[9px] text-neutral-500">ID: {partner.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{partner.name}</h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{partner.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[10px] text-neutral-500">Secured</span>
                    <button
                      onClick={() => handlePartnerRedirect(partner.id)}
                      className="px-3.5 py-1.5 bg-neutral-800 hover:bg-gradient-to-r hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-[11px] rounded-md transition-all duration-300"
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
}
