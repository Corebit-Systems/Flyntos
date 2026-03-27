export function Header({ locale, brand }: { locale: string; brand: string }){
return <header><div><a href={'/'+locale}>{brand}</a><nav><a href={'/'+locale}>Home</a> <a href={'/'+locale+'/results'}>Results</a></nav></div></header>;
}
