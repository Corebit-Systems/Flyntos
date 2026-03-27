export const cn=(...c:(string|false|null|undefined)[])=>c.filter(Boolean).join(' ');
export const buildRoute=(...s:(string|undefined)[])=>`/${s.filter(Boolean).map(v=>v?.replace(/^\/+|\/+$/g,'')).join('/')}`;
export const formatDuration=(m:number)=>`${Math.floor(m/60)}h ${m%60}m`;
export const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
