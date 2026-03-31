export function Footer({ locale }: { locale: string }) {
  return (
    <footer className='site-footer'>
      <div className='site-footer__inner'>
        <div>
          <div className='site-footer__brand'>Flyntos</div>
          <div>Search orchestration, locale-aware UX, and a calmer route to flight discovery.</div>
        </div>
        <div className='site-footer__links'>
          <a href={'/' + locale}>Home</a>
          <a href={'/' + locale + '/results'}>Results</a>
        </div>
      </div>
    </footer>
  );
}
