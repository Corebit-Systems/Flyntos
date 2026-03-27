import { scenarios } from '@flyntos/config';
export function ScenarioSwitcher({ locale, query, current }: { locale: string; query: Record<string,string | undefined>; current: string }) {
const entries=Object.values(scenarios);
const hrefFor=(scenario:string)=>{const params=new URLSearchParams();Object.entries(query).forEach(([key,value])=>{if(value)params.set(key,value);});params.set('scenario',scenario);return '/'+locale+'/results?'+params.toString();};
return <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{entries.map(item=><a key={item.type} href={hrefFor(item.type)} style={{padding:'9px 14px',borderRadius:999,border:'1px solid rgba(255,255,255,.12)',background:item.type===current?'rgba(142,160,255,.12)':'rgba(255,255,255,.03)',color:item.type===current?'#f8fafc':'#94a3b8',fontSize:13}}>{item.label}</a>)}</div>;
}
