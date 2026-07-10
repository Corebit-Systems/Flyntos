import { SearchContext, PartnerLinkResult } from '../../types/partner';

export abstract class BasePartnerAdapter {
  /**
   * Generates a partner-specific deeplink.
   * @param context The standardized search context.
   * @param subId A unique tracking identifier for this specific search.
   * @returns PartnerLinkResult if applicable, or null if the partner cannot fulfill the request.
   */
  abstract generateLink(context: SearchContext, subId: string): PartnerLinkResult | null;
}
