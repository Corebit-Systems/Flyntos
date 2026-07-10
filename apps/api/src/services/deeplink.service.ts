import { SearchContext, PartnerLinkResult } from '../types/partner';
import { BasePartnerAdapter } from '../providers/partners/base';
import { KiwiAffiliateAdapter } from '../providers/partners/kiwi';
import { AviasalesAdapter } from '../providers/partners/aviasales';
import { LocalrentAdapter } from '../providers/partners/localrent';
import { KiwiTaxiAdapter } from '../providers/partners/kiwitaxi';
import { GetYourGuideAdapter } from '../providers/partners/getyourguide';
import { KlookAdapter } from '../providers/partners/klook';

export class DeeplinkGeneratorService {
  private adapters: BasePartnerAdapter[];

  constructor() {
    this.adapters = [
      new KiwiAffiliateAdapter(),
      new AviasalesAdapter(),
      new LocalrentAdapter(),
      new KiwiTaxiAdapter(),
      new GetYourGuideAdapter(),
      new KlookAdapter()
    ];
  }

  /**
   * Generates a unique tracking marker (subId) for a specific search context.
   */
  private generateSubId(context: SearchContext): string {
    const timestamp = Date.now().toString(36);
    return `flyntos-${timestamp}-${context.originIata}${context.destinationIata}`;
  }

  /**
   * Orchestrates the generation of all applicable partner links.
   * @param context The standardized search parameters
   * @returns Array of generated partner links
   */
  public generateAllLinks(context: SearchContext): PartnerLinkResult[] {
    const subId = this.generateSubId(context);
    const results: PartnerLinkResult[] = [];

    for (const adapter of this.adapters) {
      const link = adapter.generateLink(context, subId);
      if (link) {
        results.push(link);
      }
    }

    return results;
  }
}
