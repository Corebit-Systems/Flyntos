'use client';

import { SearchForm } from './search-form';

interface WizardContainerProps {
  locale: string;
  dict: any;
  proofItems?: Array<{ label: string; value: string }>;
  previewItems?: string[];
}

export function WizardContainer({ locale, dict }: WizardContainerProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center z-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center mb-8">
          Находите более умные маршруты
        </h1>
        <div className="w-full">
          <SearchForm locale={locale} labels={dict?.ui?.hero || { from: 'From', to: 'To', depart: 'Depart', return: 'Return', cta: 'Искать рейсы' }} />
        </div>
      </div>
    </div>
  );
}

