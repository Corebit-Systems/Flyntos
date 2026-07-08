'use client';

import { motion } from 'framer-motion';
import { SearchForm } from './search-form';

interface WizardContainerProps {
  locale: string;
  dict: any;
  proofItems: Array<{ label: string; value: string }>;
  previewItems: string[];
}

export function WizardContainer({ locale, dict, proofItems, previewItems }: WizardContainerProps) {
  return (
    <div className="relative min-h-[90vh] bg-neutral-950 overflow-hidden flex flex-col items-center justify-center py-12">
      {/* Deep dark glowing radial gradients */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-700/20 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-700/20 rounded-full blur-[150px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="site-shell z-10 w-full max-w-[1180px] px-4">
        {/* Main Grid: Copy and Preview panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Copy section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div className="text-teal-400 font-semibold uppercase tracking-wider text-xs mb-3">
              {dict.ui.hero.eyebrow}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              {dict.ui.hero.title}
            </h1>
            <p className="text-neutral-400 text-lg mb-8 max-w-xl">
              Flyntos turns flight search into a refined product surface: faster route discovery, clearer scenarios,
              and a premium multi-locale foundation that feels ready for real scale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {proofItems.map((item) => (
                <div key={item.label} className="border-l-2 border-teal-400/50 pl-4 py-1">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-sm text-neutral-400 leading-relaxed">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Premium Preview Panel (Glassmorphism card) */}
          <motion.aside
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_30px_90px_rgba(3,7,18,0.42)]"
          >
            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-2">Preview</div>
            <h2 className="text-lg font-bold text-white mb-3">What this landing surface is setting up</h2>
            <p className="text-sm text-neutral-400 mb-6">
              A quieter premium shell for search now, with enough structure to support richer filters, provider depth,
              and market-specific entry points next.
            </p>
            <ul className="space-y-3 mb-6">
              {previewItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                Fast input rhythm
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                Layered glass surface
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                Built for scale
              </span>
            </div>
          </motion.aside>
        </div>

        {/* Master Wizard Container (Glassmorphic map/form container) */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
          className="p-8 md:p-10 rounded-[32px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="mb-6">
            <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Search workspace</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Search with confidence, not form fatigue.</h2>
            <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Route, timing, and traveler count are aligned into one production-grade surface so the primary action stays obvious.
            </p>
          </div>
          <SearchForm locale={locale} labels={dict.ui.hero} />
        </motion.div>
      </div>
    </div>
  );
}
