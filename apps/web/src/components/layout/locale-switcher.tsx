'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { activeLocales } from '../../lib/get-locale';
export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
const pathname=usePathname();
const search=useSearchParams();
const buildHref=(nextLocale:string)=>{const parts=pathname.split('/');if(parts.length>1)parts[1]=nextLocale;const query=search.toString();return parts.join('/')+(query?'?'+query:'');};
return <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{activeLocales.map(locale=><a key={locale} href={buildHref(locale)} style={{padding:'8px 12px',borderRadius:999,border:'1px solid rgba(255,255,255,.12)',background:locale===currentLocale?'rgba(142,160,255,.12)':'rgba(255,255,255,.03)',color:locale===currentLocale?'#f8fafc':'#94a3b8',fontSize:12,textTransform:'uppercase',letterSpacing:'.16em'}}>{locale}</a>)}</div>;
}
