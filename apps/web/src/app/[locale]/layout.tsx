import type { ReactNode } from 'react';
import { getDictionary, getLocaleMeta } from '@flyntos/i18n';
import { getLocale } from '../../lib/get-locale';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  const dict = getDictionary(locale);
  const meta = getLocaleMeta(locale);

  return (
    <div dir={meta?.dir ?? 'ltr'} className='app-shell'>
      <Header locale={locale} brand={dict.ui.brand} />
      <main>{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
