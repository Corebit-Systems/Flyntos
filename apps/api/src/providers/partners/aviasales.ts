import { SearchContext, PartnerLinkResult } from '../../types/partner';
import { BasePartnerAdapter } from './base';

export class AviasalesAdapter extends BasePartnerAdapter {
  private readonly MARKER = process.env.AVIASALES_MARKER || '547770';

  /**
   * Helper to convert YYYY-MM-DD to DDMM
   */
  private formatToDDMM(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // parts[0] = YYYY, parts[1] = MM, parts[2] = DD
      return `${parts[2]}${parts[1]}`;
    }
    return dateStr;
  }

  generateLink(context: SearchContext, subId: string): PartnerLinkResult | null {
    // Generate the DDMM format as requested
    const departDDMM = this.formatToDDMM(context.departureDate);
    const returnDDMM = context.returnDate ? this.formatToDDMM(context.returnDate) : '';

    // Typical Aviasales path format: /search/MOW1509TIV22091
    // where MOW=origin, 1509=depart, TIV=destination, 2209=return, 1=adults
    const pathParams = `${context.originIata}${departDDMM}${context.destinationIata}${returnDDMM}${context.passengers}`;
    
    // We can use either the path format or query params format. 
    // We'll construct the query param format to be 100% robust for TP Media,
    // but we can also inject the DDMM if we rely on the path. 
    // Let's use the explicit standard query format as it's more stable for tp.media,
    // but to fulfill the "DDMM" requirement in the prompt, let's use the path string.
    
    const searchUrl = `https://www.aviasales.com/search/${pathParams}`;

    // Now wrap it in the Travelpayouts (TP) media redirect link
    const tpParams = new URLSearchParams();
    tpParams.set('marker', this.MARKER);
    tpParams.set('p', '4114'); // standard program ID for Aviasales
    tpParams.set('sub_id', subId);
    tpParams.set('u', searchUrl);

    const deeplink = `https://tp.media/r?${tpParams.toString()}`;

    return {
      partnerName: 'Aviasales',
      serviceType: 'flight',
      deeplink,
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/aviasales.svg',
    };
  }
}
