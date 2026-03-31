'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { activeLocales } from '../../lib/get-locale';

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
    <div className='locale-switcher'>
      {activeLocales.map((locale) => (
        <a
          key={locale}
          href={buildHref(locale)}
          className={'locale-switcher__item' + (locale === currentLocale ? ' is-active' : '')}
        >
          {locale}
        </a>
      ))}
    </div>
  );
}
