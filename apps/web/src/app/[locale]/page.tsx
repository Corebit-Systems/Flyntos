// Main entrypoint for localized routing rendering the Wizard search interface
import { getDictionary } from '@flyntos/i18n';
import { getLocale } from '../../lib/get-locale';
import { WizardContainer } from '../../components/search/WizardContainer';

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
    <WizardContainer
      locale={locale}
      dict={dict}
      proofItems={proofItems}
      previewItems={previewItems}
    />
  );
}
