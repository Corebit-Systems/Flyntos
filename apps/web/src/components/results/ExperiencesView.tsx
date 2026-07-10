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
      transferBtn: 'Book Transfer',
      excursionsBtn: 'Explore Activities'
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
          const data: PartnerLinkResult[] = Array.isArray(json) ? json : json.data || [];
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
        <p className="text-neutral-400 text-sm">Loading Premium Extras...</p>
      </div>
    );
  }

  const transferLinks = links.filter(l => l.serviceType === 'transfer');
  const experienceLinks = links.filter(l => l.serviceType === 'experience');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Transfers */}
      {transferLinks.map((link, idx) => (
        <div key={link.id || `transfer-${idx}`} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-2xl min-h-[350px] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div 
              className="w-full h-48 bg-cover bg-center rounded-2xl mb-6 group-hover:scale-[1.03] transition-transform duration-700 shadow-lg" 
              style={{ backgroundImage: `url('${link.imageUrl}')` }}
            />
            <div className="flex items-center gap-3 mb-3">
              {link.logoUrl && <img src={link.logoUrl} alt={link.partnerName} className="h-6 object-contain" />}
              <h4 className="text-2xl font-bold text-white">{link.title}</h4>
            </div>
            <p className="text-base text-neutral-300 leading-relaxed mb-6">
              {link.description}
            </p>
          </div>
          
          <a href={link.deeplink} target="_blank" rel="noopener noreferrer" className="relative z-10 w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-emerald-500/40 active:scale-[0.98] cursor-pointer text-center block">
            {rp.extras.transferBtn}
          </a>
        </div>
      ))}

      {/* Experiences */}
      {experienceLinks.map((link, idx) => (
        <div key={link.id || `exp-${idx}`} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-2xl min-h-[350px] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div 
              className="w-full h-48 bg-cover bg-center rounded-2xl mb-6 group-hover:scale-[1.03] transition-transform duration-700 shadow-lg" 
              style={{ backgroundImage: `url('${link.imageUrl}')` }}
            />
            <div className="flex items-center gap-3 mb-3">
              {link.logoUrl && <img src={link.logoUrl} alt={link.partnerName} className="h-6 object-contain" />}
              <h4 className="text-2xl font-bold text-white">{link.title}</h4>
            </div>
            <p className="text-base text-neutral-300 leading-relaxed mb-6">
              {link.description}
            </p>
          </div>

          <a href={link.deeplink} target="_blank" rel="noopener noreferrer" className="relative z-10 w-full py-4 bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-purple-500/40 active:scale-[0.98] cursor-pointer text-center block">
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
