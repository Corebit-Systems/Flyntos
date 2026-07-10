import React from 'react';
import { FlightFiltersState, SortType } from '../../types/flight';
import { FlightMetadata } from '../../hooks/useFlightFilters';

interface FilterSidebarProps {
  filters: FlightFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FlightFiltersState>>;
  sortType: SortType;
  setSortType: React.Dispatch<React.SetStateAction<SortType>>;
  metadata: FlightMetadata;
}

export function FilterSidebar({
  filters,
  setFilters,
  sortType,
  setSortType,
  metadata
}: FilterSidebarProps) {
  const handleStopToggle = (stopValue: number) => {
    setFilters(prev => {
      const newStops = prev.stops.includes(stopValue)
        ? prev.stops.filter(s => s !== stopValue)
        : [...prev.stops, stopValue];
      return { ...prev, stops: newStops };
    });
  };

  const handleAirlineToggle = (code: string) => {
    setFilters(prev => {
      const newAirlines = prev.airlines.includes(code)
        ? prev.airlines.filter(a => a !== code)
        : [...prev.airlines, code];
      return { ...prev, airlines: newAirlines };
    });
  };

  const handleCnxToggle = (type: string) => {
    setFilters(prev => {
      const newCnx = prev.cnxTypes.includes(type)
        ? prev.cnxTypes.filter(t => t !== type)
        : [...prev.cnxTypes, type];
      return { ...prev, cnxTypes: newCnx };
    });
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative z-10 flex flex-col gap-8 h-fit">
      
      {/* Sorting */}
      <div>
        <h3 className="text-sm tracking-widest uppercase text-neutral-400 font-bold mb-4">Сортировка</h3>
        <div className="flex flex-col gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['cheapest', 'fastest', 'optimal'] as SortType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSortType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                sortType === type 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type === 'cheapest' && 'Сначала дешевые'}
              {type === 'fastest' && 'Сначала быстрые'}
              {type === 'optimal' && 'Оптимальные'}
            </button>
          ))}
        </div>
      </div>

      {/* Price filter */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm tracking-widest uppercase text-neutral-400 font-bold">Цена, до</h3>
          <span className="text-sm font-bold text-white">
            {filters.maxPrice ?? metadata.maxPrice}
          </span>
        </div>
        <input 
          type="range" 
          min={metadata.minPrice} 
          max={metadata.maxPrice} 
          value={filters.maxPrice ?? metadata.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-neutral-500 mt-2">
          <span>{metadata.minPrice}</span>
          <span>{metadata.maxPrice}</span>
        </div>
      </div>

      {/* Stops filter */}
      <div>
        <h3 className="text-sm tracking-widest uppercase text-neutral-400 font-bold mb-4">Пересадки</h3>
        <div className="flex flex-col gap-3">
          {[
            { value: 0, label: 'Прямые' },
            { value: 1, label: '1 пересадка' },
            { value: 2, label: '2 и более' }
          ].map(stop => (
            <label key={stop.value} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                filters.stops.includes(stop.value) ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-neutral-600 group-hover:border-blue-400'
              }`}>
                {filters.stops.includes(stop.value) && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                )}
              </div>
              <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{stop.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Smart Connect */}
      <div>
        <h3 className="text-sm tracking-widest uppercase text-neutral-400 font-bold mb-4">Тип стыковки</h3>
        <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl border border-white/5 bg-white/5 hover:border-blue-500/30 transition-all">
          <span className="text-sm text-neutral-300 font-medium">Smart Connect</span>
          <div className={`w-10 h-5 rounded-full p-1 transition-colors ${
            !filters.cnxTypes.includes('Flyntos_SmartConnect') ? 'bg-blue-500' : 'bg-neutral-600'
          }`}>
            <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${
              !filters.cnxTypes.includes('Flyntos_SmartConnect') ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </label>
        <p className="text-xs text-neutral-500 mt-2">
          Выключите, чтобы скрыть самостоятельные стыковки Flyntos.
        </p>
      </div>

      {/* Baggage */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
            filters.baggageIncluded ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-neutral-600 group-hover:border-blue-400'
          }`}>
            {filters.baggageIncluded && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            )}
          </div>
          <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">Только с багажом</span>
        </label>
      </div>

      {/* Airlines */}
      {metadata.airlines.length > 0 && (
        <div>
          <h3 className="text-sm tracking-widest uppercase text-neutral-400 font-bold mb-4">Авиакомпании</h3>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {metadata.airlines.map(airline => (
              <label key={airline.code} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    filters.airlines.includes(airline.code) ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-neutral-600 group-hover:border-blue-400'
                  }`}>
                    {filters.airlines.includes(airline.code) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors truncate max-w-[120px]" title={airline.name}>
                    {airline.name}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">от {airline.minPrice}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      <button 
        onClick={() => {
          setFilters({
            maxPrice: null,
            stops: [],
            airlines: [],
            cnxTypes: [],
            baggageIncluded: false
          });
          setSortType('cheapest');
        }}
        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10"
      >
        Сбросить фильтры
      </button>

    </div>
  );
}
