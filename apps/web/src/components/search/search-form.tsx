import { scenarios } from '@flyntos/config';

export function SearchForm({ locale, labels }: { locale: string; labels: any }) {
  const scenarioOptions = Object.values(scenarios);

  return (
    <form action={'/' + locale + '/results'} method='get' className='search-form'>
      <div className='search-form__grid'>
        <label className='field'>
          <span className='field__label'>{labels.from}</span>
          <input className='field__control' name='origin' placeholder='SOF' required />
        </label>

        <label className='field'>
          <span className='field__label'>{labels.to}</span>
          <input className='field__control' name='destination' placeholder='MAD' required />
        </label>

        <label className='field'>
          <span className='field__label'>{labels.depart}</span>
          <input className='field__control' name='departureDate' type='date' required />
        </label>

        <label className='field'>
          <span className='field__label'>{labels.return}</span>
          <input className='field__control' name='returnDate' type='date' />
        </label>

        <label className='field'>
          <span className='field__label'>Passengers</span>
          <select className='field__select' name='adults' defaultValue='1'>
            <option value='1'>1 traveler</option>
            <option value='2'>2 travelers</option>
            <option value='3'>3 travelers</option>
            <option value='4'>4 travelers</option>
            <option value='5'>5 travelers</option>
            <option value='6'>6 travelers</option>
          </select>
        </label>
      </div>

      <div className='search-form__footer'>
        <div className='search-form__scenarios'>
          <span className='field__label'>Scenario</span>
          <div className='scenario-row'>
            {scenarioOptions.map((item) => (
              <label key={item.type} className='scenario-chip'>
                <input defaultChecked={item.type === 'standard'} type='radio' name='scenario' value={item.type} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button className='search-cta' type='submit'>
          {labels.cta}
        </button>
      </div>
    </form>
  );
}
