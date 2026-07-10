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
      budgetBtn: 'Find Vehicle in {city}',
    }
  };

  useEffect(() => {
    async function fetchLinks() {
      if (!originCode || !destinationCode || !departDate) {
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
  }, [originCode, destinationCode, departDate, returnDate]);

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
        <p className="text-neutral-400 text-sm">No car rental partners available for {destinationName} right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {carLinks.map((car, idx) => (
        <div key={car.id || idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-2xl group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div 
              className="w-full h-48 bg-cover bg-center rounded-2xl mb-6 group-hover:scale-[1.03] transition-transform duration-700 shadow-lg" 
              style={{ backgroundImage: `url('${car.imageUrl}')` }}
            />
            <div className="flex items-center gap-3 mb-3">
              {car.logoUrl && <img src={car.logoUrl} alt={car.partnerName} className="h-6 object-contain" />}
              <h4 className="text-2xl font-bold text-white">{car.title}</h4>
            </div>
            <p className="text-base text-neutral-300 leading-relaxed mb-6">
              {car.description}
            </p>
          </div>

          <a href={car.deeplink} target="_blank" rel="noopener noreferrer" className="relative z-10 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-blue-500/40 active:scale-[0.98] cursor-pointer text-center block">
            {rp.cars.budgetBtn.replace('{city}', destinationName)}
          </a>
        </div>
      ))}
    </div>
  );
}
