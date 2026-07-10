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
  id: string;
  partnerName: string;
  serviceType: 'flight' | 'car' | 'transfer' | 'experience';
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  deeplink: string;
  logoUrl?: string;
}

export function CarResultsView({
  dict,
  originCode = '',
  destinationCode = '',
  destinationName = '...',
  departDate = '',
  returnDate = ''
}: CarResultsViewProps) {
  const [carLinks, setCarLinks] = useState<PartnerLinkResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rp = dict?.ui?.resultsPage || {
    cars: {
      budgetBtn: 'Rent a car in {city}',
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
            locale: 'en',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const links: PartnerLinkResult[] = Array.isArray(json) ? json : json.data || [];
          setCarLinks(links.filter((l) => l.serviceType === 'car'));
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

  if (carLinks.length === 0) {
    return (
      <div className="w-full py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-xl text-center px-4">
        <p className="text-neutral-400 text-sm">No cars available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {carLinks.map((car, idx) => (
        <div key={car.id || idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl group">
          <div>
            <div 
              className="w-full h-32 bg-cover bg-center rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-500" 
              style={{ backgroundImage: `url('${car.imageUrl}')` }}
            />
            <h4 className="text-lg font-bold text-white mb-2">{car.title}</h4>
            <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{car.description}</p>
            <div className="text-xl font-bold text-emerald-400 mb-6">
              from {car.price} {car.currency} <span className="text-xs text-neutral-500 font-normal">/ day</span>
            </div>
          </div>
          <a href={car.deeplink} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer text-center block">
            {rp.cars.budgetBtn.replace('{city}', destinationName)}
          </a>
        </div>
      ))}
    </div>
  );
}
