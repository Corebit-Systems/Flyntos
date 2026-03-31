import { getDictionary } from '@flyntos/i18n';
import { getLocale } from '../../lib/get-locale';
import { SearchForm } from '../../components/search/search-form';

const proofItems = [
  { label: 'Search', value: 'Scenario-aware ranking that keeps the best route visible fast.' },
  { label: 'Locales', value: 'Multi-locale routing designed to scale without breaking the experience.' },
  { label: 'Providers', value: 'A cleaner orchestration layer for aggregator logic, supply, and future expansion.' }
];

const previewItems = [
  'Premium route search with calmer visual hierarchy and faster first actions.',
  'Scenario presets that support cheapest, family, business, and direct-priority discovery.',
  'A product shell built for result filters, SEO landing surfaces, and provider growth.'
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  const dict = getDictionary(locale);

  return (
    <section className='home-hero'>
      <div className='site-shell'>
        <div className='home-hero__grid'>
          <div className='home-hero__copy'>
            <div className='hero-kicker'>{dict.ui.hero.eyebrow}</div>
            <h1 className='hero-title'>{dict.ui.hero.title}</h1>
            <p className='hero-subtitle'>
              Flyntos turns flight search into a refined product surface: faster route discovery, clearer scenarios,
              and a premium multi-locale foundation that feels ready for real scale.
            </p>

            <div className='hero-proof'>
              {proofItems.map((item) => (
                <div key={item.label} className='hero-proof__item'>
                  <div className='hero-proof__label'>{item.label}</div>
                  <div className='hero-proof__value'>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className='glass-panel preview-panel'>
            <div className='preview-panel__eyebrow'>Preview</div>
            <h2 className='preview-panel__title'>What this landing surface is setting up</h2>
            <p className='preview-panel__body'>
              A quieter premium shell for search now, with enough structure to support richer filters, provider depth,
              and market-specific entry points next.
            </p>
            <ul className='preview-panel__list'>
              {previewItems.map((item) => (
                <li key={item} className='preview-panel__item'>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className='preview-panel__meta'>
              <span className='preview-panel__pill'>Fast input rhythm</span>
              <span className='preview-panel__pill'>Layered glass surface</span>
              <span className='preview-panel__pill'>Built for scale</span>
            </div>
          </aside>
        </div>

        <div className='glass-panel search-shell'>
          <div className='search-shell__header'>
            <div>
              <div className='search-shell__eyebrow'>Search workspace</div>
              <h2 className='search-shell__title'>Search with confidence, not form fatigue.</h2>
            </div>
            <p className='search-shell__body'>
              Route, timing, and traveler count are aligned into one production-grade surface so the primary action stays obvious.
            </p>
          </div>
          <SearchForm locale={locale} labels={dict.ui.hero} />
        </div>
      </div>
    </section>
  );
}
