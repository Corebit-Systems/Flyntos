import fs from 'fs';

async function run() {
  console.log('Fetching open data from Travelpayouts...');
  try {
    const [citiesRu, citiesEn, countriesRu] = await Promise.all([
      fetch('https://api.travelpayouts.com/data/ru/cities.json').then(r => r.json()),
      fetch('https://api.travelpayouts.com/data/en/cities.json').then(r => r.json()),
      fetch('https://api.travelpayouts.com/data/ru/countries.json').then(r => r.json()),
    ]);

    const countriesMap = new Map(countriesRu.map(c => [c.code, c.name]));
    const citiesEnMap = new Map(citiesEn.map(c => [c.code, c.name]));

    const result = citiesRu.map(c => ({
      code: c.code,
      name_ru: c.name || '',
      name_en: citiesEnMap.get(c.code) || '',
      city_ru: c.name || '',
      city_en: citiesEnMap.get(c.code) || '',
      country_ru: countriesMap.get(c.country_code) || c.country_code || '',
    })).filter(c => c.name_ru || c.name_en);

    fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/airports.json', JSON.stringify(result));
    console.log('Saved ' + result.length + ' cities to src/data/airports.json.');
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

run();
