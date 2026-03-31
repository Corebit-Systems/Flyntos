'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { activeLocales } from '../../lib/get-locale';

const localeLabel = (locale: string) => locale.toUpperCase();

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const search = useSearchParams();

  const buildHref = (nextLocale: string) => {
    const parts = pathname.split('/');
    if (parts.length > 1) parts[1] = nextLocale;
    const query = search.toString();
    return parts.join('/') + (query ? '?' + query : '');
  };

  return (
    <details className='locale-switcher locale-switcher--menu'>
      <summary className='locale-switcher__trigger' aria-label={'Change language. Current locale ' + currentLocale}>
        <span className='locale-switcher__current'>{localeLabel(currentLocale)}</span>
        <span className='locale-switcher__chevron' aria-hidden='true'>v</span>
      </summary>
      <div className='locale-switcher__menu' role='menu' aria-label='Language selector'>
        {activeLocales.map((locale) => (
          <a
            key={locale}
            href={buildHref(locale)}
            role='menuitem'
            className={'locale-switcher__option' + (locale === currentLocale ? ' is-active' : '')}
            aria-current={locale === currentLocale ? 'true' : undefined}
          >
            <span>{localeLabel(locale)}</span>
            {locale === currentLocale ? <span className='locale-switcher__check'>Current</span> : null}
          </a>
        ))}
      </div>
    </details>
  );
}
