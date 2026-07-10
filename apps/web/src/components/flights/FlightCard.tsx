import React from 'react';
import { FlightOffer } from '../../types/flight';

export function FlightCard({ offer }: { offer: FlightOffer }) {
  const isDirect = offer.stops === 0;
  const stopsText = isDirect ? 'Прямой' : `${offer.stops} пересадк${offer.stops > 1 ? 'и' : 'а'}`;
  
  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-blue-500/30 transition-all mb-4 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-500"></div>

      <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
        <div className="grid gap-3">
          <div className="text-xs tracking-widest uppercase text-neutral-400 font-medium">
            {offer.airlineName} <span className="mx-2">•</span> {stopsText}
          </div>
          
          <div className="text-2xl font-bold tracking-tight text-white">
            {offer.origin} → {offer.destination}
          </div>
          
          <div className="text-neutral-300 flex items-center gap-2">
            <span className="font-medium text-white">{offer.departureTime}</span>
            <span className="text-neutral-500">—</span>
            <span className="font-medium text-white">{offer.arrivalTime}</span>
            <span className="mx-2 text-neutral-500">•</span>
            <span>{Math.floor(offer.totalDurationMinutes / 60)}ч {offer.totalDurationMinutes % 60}м</span>
          </div>

          <div className="flex gap-3 flex-wrap text-sm text-neutral-400 mt-1">
            {offer.baggageIncluded && (
              <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Багаж включен
              </span>
            )}
            {offer.cnxType === 'Flyntos_SmartConnect' && (
              <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
                ✨ Smart Connect
              </span>
            )}
          </div>
        </div>

        <div className="text-left md:text-right flex flex-col justify-between">
          <div className="grid gap-1">
            <div className="text-xs tracking-widest uppercase text-neutral-400">Лучшая цена</div>
            <div className="text-3xl font-bold tracking-tight text-white">
              {offer.price} {offer.currency}
            </div>
            {offer.score > 0 && (
              <div className="text-xs text-neutral-500 mt-1">Рейтинг: {offer.score.toFixed(1)}</div>
            )}
          </div>
          
          <button className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.98]">
            Выбрать
          </button>
        </div>
      </div>
    </div>
  );
}
