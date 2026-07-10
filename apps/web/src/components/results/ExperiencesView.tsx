'use client'; 

import React, { useEffect, useState } from 'react';

interface ExperiencesViewProps {
  dict?: any;
  originCode?: string;
  destinationCode?: string;
  destinationName?: string;
  departDate?: string;
  returnDate?: string;
}

interface PartnerLinkResult {
  partnerName: string;
  serviceType: 'flight' | 'car' | 'transfer' | 'experience';
  deeplink: string;
  logoUrl: string;
  minEstimatedPrice?: number;
}

export function ExperiencesView({
  dict,
  originCode = '',
  destinationCode = '',
  destinationName = '...',
  departDate = '',
  returnDate = ''
}: ExperiencesViewProps) {
  const [links, setLinks] = useState<PartnerLinkResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rp = dict?.ui?.resultsPage || {
    extras: {
      transferTitle: 'Airport Transfer',
      transferDesc: 'Comfortable individual transfer from the airport to your hotel.',
      transferBtn: 'Book Transfer',
      excursionsTitle: 'Experiences & Tours',
      excursionsDesc: 'Book top-rated tours and activities in {city}.',
      excursionsBtn: 'View Experiences'
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
            locale: 'en', // fallback, actual locale could be passed from dict/context
          }),
        });

        if (res.ok) {
          const data: PartnerLinkResult[] = await res.json();
          setLinks(data.filter(l => l.serviceType === 'transfer' || l.serviceType === 'experience'));
        }
      } catch (err) {
        console.error('Failed to fetch experience links:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinks();
  }, [originCode, destinationCode, departDate, returnDate]);

  if (isLoading) {
    return (
      <div className="w-full py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-xl text-center px-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-400 text-sm">Searching for transfers and experiences...</p>
      </div>
    );
  }

  const transferLinks = links.filter(l => l.serviceType === 'transfer');
  const experienceLinks = links.filter(l => l.serviceType === 'experience');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Transfers */}
      {transferLinks.map((link, idx) => (
        <div key={`transfer-${idx}`} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
          <div>
            <h4 className="text-lg font-bold text-white mb-2">{rp.extras.transferTitle} - {link.partnerName}</h4>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              {rp.extras.transferDesc.replace('{city}', destinationName)}
            </p>
          </div>
          <a href={link.deeplink} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
            {rp.extras.transferBtn}
          </a>
        </div>
      ))}

      {/* Experiences */}
      {experienceLinks.map((link, idx) => (
        <div key={`exp-${idx}`} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
          <div>
            <h4 className="text-lg font-bold text-white mb-2">{rp.extras.excursionsTitle} - {link.partnerName}</h4>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              {rp.extras.excursionsDesc.replace('{city}', destinationName)}
            </p>
          </div>
          <a href={link.deeplink} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
            {rp.extras.excursionsBtn}
          </a>
        </div>
      ))}

      {links.length === 0 && (
        <div className="col-span-1 md:col-span-2 py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-xl text-center px-4">
           <p className="text-neutral-400 text-sm">No specific transfers or experiences available right now.</p>
        </div>
      )}
    </div>
  );
}
