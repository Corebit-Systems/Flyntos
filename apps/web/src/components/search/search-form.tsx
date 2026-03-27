export function SearchForm({ locale, labels }: { locale: string; labels: any }){
return <form action={'/'+locale+'/results'} method='get'><div><label>{labels.from}<input name='origin' required /></label><label>{labels.to}<input name='destination' required /></label><label>{labels.depart}<input name='departureDate' type='date' required /></label><label>{labels.return}<input name='returnDate' type='date' /></label><button type='submit'>{labels.cta}</button></div></form>;
}
