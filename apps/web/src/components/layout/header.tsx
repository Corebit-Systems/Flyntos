'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from './locale-switcher';

const isHomePath = (pathname: string, locale: string) => pathname === '/' + locale;
const isResultsPath = (pathname: string, locale: string) => pathname.startsWith('/' + locale + '/results');

export function Header({ locale, brand }: { locale: string; brand: string }) {
  const pathname = usePathname();
  const displayBrand = 'Flyntos';

  return (
    <header className='site-header'>
      <div className='site-header__inner'>
        <div className='site-header__brand'>
          <a href={'/' + locale} className='brand-lockup' aria-label={brand}>
            <span className='brand-lockup__media' aria-hidden='true'>
              <Image className='brand-lockup__logo' src='/brand/logo.svg' alt='' width={56} height={56} priority />
            </span>
            <span className='brand-lockup__wordmark'>{displayBrand}</span>
          </a>
          <nav className='site-nav' aria-label='Primary'>
            <a
              href={'/' + locale}
              className={'site-nav__link' + (isHomePath(pathname, locale) ? ' is-active' : '')}
              aria-current={isHomePath(pathname, locale) ? 'page' : undefined}
            >
              Home
            </a>
            <a
              href={'/' + locale + '/results'}
              className={'site-nav__link' + (isResultsPath(pathname, locale) ? ' is-active' : '')}
              aria-current={isResultsPath(pathname, locale) ? 'page' : undefined}
            >
              Results
            </a>
          </nav>
        </div>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
