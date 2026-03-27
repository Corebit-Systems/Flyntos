import { isLocaleCode, defaultLocale } from '@flyntos/config';
export function getLocale(locale: string){return isLocaleCode(locale)?locale:defaultLocale;}
export const activeLocales=['en','ru','es','ar'] as const;
