'use client';

import React, { useState } from 'react';
import { FlightOffer, FlightFiltersState, SortType } from '../../types/flight';
import { useFlightFilters } from '../../hooks/useFlightFilters';
import { FilterSidebar } from './FilterSidebar';
import { FlightCard } from './FlightCard';

export function FlightResultsView({ initialOffers }: { initialOffers: FlightOffer[] }) {
  const [filters, setFilters] = useState<FlightFiltersState>({
    maxPrice: null,
    stops: [],
    airlines: [],
    cnxTypes: [],
    baggageIncluded: false,
  });

  const [sortType, setSortType] = useState<SortType>('cheapest');

  const { filteredOffers, metadata } = useFlightFilters(initialOffers, filters, sortType);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10 px-4">
      
      {/* Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-24">
          <FilterSidebar 
            filters={filters}
            setFilters={setFilters}
            sortType={sortType}
            setSortType={setSortType}
            metadata={metadata}
          />
        </div>
      </div>

      {/* Flight List */}
      <div className="flex-1 flex flex-col gap-4">
        {filteredOffers.length > 0 ? (
          filteredOffers.map(offer => (
            <FlightCard key={offer.id} offer={offer} />
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl relative z-10">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <svg className="w-9 h-9 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Ничего не найдено</h3>
            <p className="text-neutral-400 text-sm max-w-md text-center mb-8">
              Нет билетов, соответствующих выбранным фильтрам. Попробуйте изменить параметры поиска.
            </p>
            <button
              onClick={() => {
                setFilters({ maxPrice: null, stops: [], airlines: [], cnxTypes: [], baggageIncluded: false });
                setSortType('cheapest');
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-wider"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
