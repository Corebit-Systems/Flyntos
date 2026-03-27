import { getDictionary } from '@flyntos/i18n';
import { getLocale } from '../../lib/get-locale';
import { SearchForm } from '../../components/search/search-form';
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) { const locale=getLocale((await params).locale); const dict=getDictionary(locale); return <section><div><div>{dict.ui.hero.eyebrow}</div><h1>{dict.ui.hero.title}</h1><p>{dict.ui.hero.subtitle}</p><SearchForm locale={locale} labels={dict.ui.hero} /></div></section>; }
