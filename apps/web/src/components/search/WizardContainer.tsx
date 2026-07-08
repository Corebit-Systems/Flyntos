'use client';

import { SearchForm } from './search-form';
import { motion } from 'framer-motion';

interface WizardContainerProps {
  locale: string;
  dict: any;
  proofItems?: Array<{ label: string; value: string }>;
  previewItems?: string[];
}

export function WizardContainer({ locale, dict, proofItems, previewItems }: WizardContainerProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-24 pb-12 p-4">
      {/* Top Search Area */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center z-10 mb-24">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center mb-8 drop-shadow-lg">
          Находите более умные маршруты
        </h1>
        <div className="w-full">
          <SearchForm locale={locale} labels={dict?.ui?.hero || { from: 'From', to: 'To', depart: 'Depart', return: 'Return', cta: 'Искать рейсы' }} />
        </div>
      </div>

      {/* Bottom Section: SEO Text and Preview Panel */}
      <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-auto pt-16 border-t border-white/5 z-10">
        {/* Copy section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <div className="text-blue-400 font-semibold uppercase tracking-wider text-xs mb-3">
            {dict?.ui?.hero?.eyebrow || "PREMIUM ROUTING"}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {dict?.ui?.hero?.title || "Flyntos turns flight search into a refined product surface"}
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-xl">
            Faster route discovery, clearer scenarios, and a premium multi-locale foundation that feels ready for real scale.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(proofItems || []).map((item) => (
              <div key={item.label} className="border-l-2 border-blue-400/50 pl-4 py-1">
                <div className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-1">{item.label}</div>
                <div className="text-sm text-neutral-400 leading-relaxed">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Premium Preview Panel */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-5 p-6 rounded-xl bg-neutral-900/40 border border-white/5 shadow-xl backdrop-blur-md"
        >
          <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-2">Preview</div>
          <h3 className="text-lg font-bold text-white mb-3">What this landing surface is setting up</h3>
          <p className="text-sm text-neutral-400 mb-6">
            A quieter premium shell for search now, with enough structure to support richer filters, provider depth,
            and market-specific entry points next.
          </p>
          <ul className="space-y-3 mb-6">
            {(previewItems || []).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
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
    </div>
  );
}

