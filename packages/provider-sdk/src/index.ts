import type{CanonicalSearchRequest,SearchResponse,CanonicalItinerary}from'@flyntos/search-contracts';
export interface ProviderCapability{code:string;supportsBaggage:boolean;supportsRefundRules:boolean;supportsMultiCity:boolean;supportsBrandedFares:boolean;supportsSeatSelection:boolean}
export interface ProviderHealth{provider:string;ok:boolean;latencyMs:number;message:string}
export interface ProviderSearchResult{provider:string;response:SearchResponse}
export interface FlightProviderAdapter{readonly provider:string;readonly capabilities:ProviderCapability;search(request:CanonicalSearchRequest):Promise<ProviderSearchResult>;healthCheck():Promise<ProviderHealth>}
export class ProviderRegistry{private adapters:FlightProviderAdapter[]=[];register(adapter:FlightProviderAdapter){this.adapters.push(adapter)}list(){return this.adapters}}
