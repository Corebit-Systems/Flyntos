'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type WizardStep = 'flights' | 'hotels' | 'cars' | 'extras';

const STEPS: WizardStep[] = ['flights', 'hotels', 'cars', 'extras'];

interface WizardState {
  step: WizardStep;
  flightsQuery: string;
  hotelsQuery: string;
  carsQuery: string;
  extrasQuery: string;
}

/**
 * XSS sanitization helper.
 * Strips HTML tags and escapes dangerous characters to prevent XSS via query parameters.
 */
export function sanitizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function useWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to get sanitized param
  const getSanitizedParam = useCallback((key: string, defaultValue: string = ''): string => {
    const rawVal = searchParams.get(key);
    return sanitizeString(rawVal) || defaultValue;
  }, [searchParams]);

  // Read initial/synced state from URL search params
  const currentStepFromUrl = getSanitizedParam('step', 'flights') as WizardStep;
  const validatedStep = STEPS.includes(currentStepFromUrl) ? currentStepFromUrl : 'flights';

  const [state, setState] = useState<WizardState>({
    step: validatedStep,
    flightsQuery: getSanitizedParam('flightsQuery'),
    hotelsQuery: getSanitizedParam('hotelsQuery'),
    carsQuery: getSanitizedParam('carsQuery'),
    extrasQuery: getSanitizedParam('extrasQuery'),
  });

  // Sync state when URL params change (e.g. Back/Forward browser navigation)
  useEffect(() => {
    const urlStep = getSanitizedParam('step', 'flights') as WizardStep;
    const validatedStep = STEPS.includes(urlStep) ? urlStep : 'flights';
    
    setState({
      step: validatedStep,
      flightsQuery: getSanitizedParam('flightsQuery'),
      hotelsQuery: getSanitizedParam('hotelsQuery'),
      carsQuery: getSanitizedParam('carsQuery'),
      extrasQuery: getSanitizedParam('extrasQuery'),
    });
  }, [searchParams, getSanitizedParam]);

  // Push new state to URL
  const updateUrl = useCallback((newState: Partial<WizardState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Safety against Prototype Pollution in URL parameters
    params.delete('__proto__');
    params.delete('constructor');

    const merged = { ...state, ...newState };

    params.set('step', merged.step);
    
    if (merged.flightsQuery) params.set('flightsQuery', sanitizeString(merged.flightsQuery));
    else params.delete('flightsQuery');

    if (merged.hotelsQuery) params.set('hotelsQuery', sanitizeString(merged.hotelsQuery));
    else params.delete('hotelsQuery');

    if (merged.carsQuery) params.set('carsQuery', sanitizeString(merged.carsQuery));
    else params.delete('carsQuery');

    if (merged.extrasQuery) params.set('extrasQuery', sanitizeString(merged.extrasQuery));
    else params.delete('extrasQuery');

    router.push(`?${params.toString()}`);
  }, [router, searchParams, state]);

  const setStep = useCallback((step: WizardStep) => {
    if (STEPS.includes(step)) {
      updateUrl({ step });
    }
  }, [updateUrl]);

  const setFlightsQuery = useCallback((query: string) => {
    updateUrl({ flightsQuery: sanitizeString(query) });
  }, [updateUrl]);

  const setHotelsQuery = useCallback((query: string) => {
    updateUrl({ hotelsQuery: sanitizeString(query) });
  }, [updateUrl]);

  const setCarsQuery = useCallback((query: string) => {
    updateUrl({ carsQuery: sanitizeString(query) });
  }, [updateUrl]);

  const setExtrasQuery = useCallback((query: string) => {
    updateUrl({ extrasQuery: sanitizeString(query) });
  }, [updateUrl]);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1] as WizardStep);
    }
  }, [state.step, setStep]);

  const prevStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1] as WizardStep);
    }
  }, [state.step, setStep]);

  return {
    ...state,
    setStep,
    setFlightsQuery,
    setHotelsQuery,
    setCarsQuery,
    setExtrasQuery,
    nextStep,
    prevStep,
    canNext: STEPS.indexOf(state.step) < STEPS.length - 1,
    canPrev: STEPS.indexOf(state.step) > 0,
    steps: STEPS,
  };
}
