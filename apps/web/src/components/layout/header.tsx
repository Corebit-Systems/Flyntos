import { LocaleSwitcher } from './locale-switcher';

export function Header({ locale, brand }: { locale: string; brand: string }) {
  return (
    <header className='site-header'>
      <div className='site-header__inner'>
        <div className='site-header__brand'>
          <a href={'/' + locale} className='brand-lockup'>
            <span className='brand-lockup__mark' aria-hidden='true' />
            <span className='brand-lockup__wordmark'>{brand}</span>
          </a>
          <span className='brand-lockup__tag'>Aggregator MVP</span>
          <nav className='site-nav'>
            <a href={'/' + locale}>Home</a>
            <a href={'/' + locale + '/results'}>Results</a>
          </nav>
        </div>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
