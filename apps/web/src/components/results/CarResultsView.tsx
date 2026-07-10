'use client'; 

import React, { useEffect, useState } from 'react';

interface CarResultsViewProps {
  dict?: any;
  originCode?: string;
  destinationCode?: string;
  destinationName?: string;
  departDate?: string;
  returnDate?: string;
}

interface PartnerLinkResult {
  partnerId: string;
  serviceType: 'flight' | 'car' | 'hotel' | 'transfer';
  url: string;
  isAvailable: boolean;
  minEstimatedPrice?: number;
  currency?: string;
}

export function CarResultsView({
  dict,
  originCode = '',
  destinationCode = '',
  destinationName = '...',
  departDate = '',
  returnDate = ''
}: CarResultsViewProps) {
  const [carLink, setCarLink] = useState<PartnerLinkResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const rp = dict?.ui?.resultsPage || {
    cars: {
      optimalTitle: 'Optimal Crossover',
      optimalDesc: 'Optimal choice for comfortable travel along coastlines and mountain switchbacks.',
      optimalPrice: 'from 35 € / day',
      optimalBtn: 'Rent a car in {city}',
      budgetTitle: 'Budget Hatchback',
      budgetDesc: 'Ideal for narrow streets of historic towns and easy parking.',
      budgetPrice: 'from 18 € / day',
      budgetBtn: 'Rent a car in {city}',
      yachtTitle: 'Cabriolet / Premium',
      yachtDesc: 'Premium choice for sunny days. Feel the breeze.',
      yachtPrice: 'from 80 € / day',
      yachtBtn: 'Rent a car in {city}'
    }
  };

  const isMontenegro = destinationCode === 'TIV' || destinationCode === 'TGD';

  useEffect(() => {
    async function fetchLinks() {
      if (!isMontenegro || !originCode || !destinationCode || !departDate) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api-proxy/partners/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originIata: originCode,
            destinationIata: destinationCode,
            departureDate: departDate,
            returnDate: returnDate || undefined,
            passengers: 1,
            locale: 'en', // fallback, actual locale could be passed from getLocale
          }),
        });

        if (res.ok) {
          const links: PartnerLinkResult[] = await res.json();
          const carService = links.find((l) => l.serviceType === 'car' && l.isAvailable);
          if (carService) {
            setCarLink(carService);
          }
        }
      } catch (err) {
        console.error('Failed to fetch car links:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinks();
  }, [originCode, destinationCode, departDate, returnDate, isMontenegro]);

  if (!isMontenegro) {
    return (
      <div className="w-full py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-xl text-center px-4">
        <svg className="w-12 h-12 text-blue-400/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h4 className="text-xl font-bold text-white mb-2">Car rentals in this region are coming soon</h4>
        <p className="text-neutral-400 text-sm max-w-md">
          We are currently working on integrating our premium car rental partners for {destinationName}. 
          Please check back later or use global providers directly.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!carLink) {
    return null;
  }

  // Simulate min prices based on the backend estimated price if provided
  const basePrice = carLink.minEstimatedPrice || 25;
  const currency = carLink.currency || '€';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Economy / Budget */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl group">
        <div>
          <div 
            className="w-full h-32 bg-cover bg-center rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-500" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80')" }}
          />
          <h4 className="text-lg font-bold text-white mb-2">{rp.cars.budgetTitle}</h4>
          <p className="text-xs font-bold text-neutral-300 mb-2">Fiat 500 / Hyundai i20 / VW Polo</p>
          <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{rp.cars.budgetDesc}</p>
          <div className="text-xl font-bold text-emerald-400 mb-6">
            from {basePrice} {currency} <span className="text-xs text-neutral-500 font-normal">/ day</span>
          </div>
        </div>
        <a href={carLink.url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer text-center block">
          {rp.cars.budgetBtn.replace('{city}', destinationName)}
        </a>
      </div>

      {/* SUV / Optimal */}
      <div className="bg-white/5 backdrop-blur-xl border-blue-500/20 border rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl group relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 uppercase tracking-widest">
          Recommended
        </div>
        <div>
          <div 
            className="w-full h-32 bg-cover bg-center rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-500" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80')" }}
          />
          <h4 className="text-lg font-bold text-white mb-2">{rp.cars.optimalTitle}</h4>
          <p className="text-xs font-bold text-neutral-300 mb-2">Nissan Qashqai / Kia Sportage</p>
          <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{rp.cars.optimalDesc}</p>
          <div className="text-xl font-bold text-emerald-400 mb-6">
            from {Math.floor(basePrice * 1.5)} {currency} <span className="text-xs text-neutral-500 font-normal">/ day</span>
          </div>
        </div>
        <a href={carLink.url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer text-center block">
          {rp.cars.optimalBtn.replace('{city}', destinationName)}
        </a>
      </div>

      {/* Cabriolet / Premium */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl group">
        <div>
          <div 
            className="w-full h-32 bg-cover bg-center rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-500" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80')" }}
          />
          <h4 className="text-lg font-bold text-white mb-2">{rp.cars.yachtTitle}</h4>
          <p className="text-xs font-bold text-neutral-300 mb-2">Mini Cooper Cabrio / BMW 4 Series</p>
          <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{rp.cars.yachtDesc}</p>
          <div className="text-xl font-bold text-emerald-400 mb-6">
            from {Math.floor(basePrice * 3.5)} {currency} <span className="text-xs text-neutral-500 font-normal">/ day</span>
          </div>
        </div>
        <a href={carLink.url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer text-center block">
          {rp.cars.yachtBtn.replace('{city}', destinationName)}
        </a>
      </div>
    </div>
  );
}
