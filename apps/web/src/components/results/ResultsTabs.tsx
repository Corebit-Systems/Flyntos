'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ResultsTabs() {
  const [currentTab, setCurrentTab] = useState<'cars' | 'extras'>('cars');

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
                {tab === 'cars' ? 'Авто & Яхты' : 'Extras'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AutoEurope */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[220px]">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-white">Аренда автомобилей</h4>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">от 15 € / день</span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Сравните цены 500+ прокатчиков. Без скрытых комиссий, бесплатная отмена.
                    </p>
                  </div>
                  <a href="http://localhost:4000/out/autoeurope" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    Найти авто
                  </a>
                </div>

                {/* SEARADAR */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[220px]">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-white">Аренда яхт и катамаранов</h4>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">от 250 € / день</span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Премиальный чартер для отдыха в Черногории, Хорватии и по всему миру. С капитаном или без.
                    </p>
                  </div>
                  <a href="http://localhost:4000/out/searadar" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    Выбрать яхту
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
                    <h4 className="text-lg font-bold text-white mb-2">Комфортный трансфер</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Трансферы из аэропортов Тивата и Подгорицы с табличкой.
                    </p>
                  </div>
                  <a href="http://localhost:4000/out/kiwitaxi" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    KiwiTaxi
                  </a>
                </div>

                {/* Klook */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Экскурсии и активности</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Билеты на достопримечательности и туры по всему миру.
                    </p>
                  </div>
                  <a href="http://localhost:4000/out/klook" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    Klook
                  </a>
                </div>

                {/* Saily */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Мобильный интернет eSIM</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Подключение к сети за 1 минуту без физических SIM-карт.
                    </p>
                  </div>
                  <a href="http://localhost:4000/out/saily" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    Saily
                  </a>
                </div>

                {/* Compensair */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl min-h-[200px]">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Компенсация за рейсы</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Верните до 600 € за задержанный или отмененный рейс.
                    </p>
                  </div>
                  <a href="http://localhost:4000/out/compensair" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center block">
                    Compensair
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
