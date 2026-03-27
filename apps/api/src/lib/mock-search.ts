import { canonicalSearchRequestSchema, type CanonicalSearchRequest, type SearchResponse } from '@flyntos/search-contracts';
import { ProviderRegistry, type FlightProviderAdapter, type ProviderHealth, type ProviderSearchResult } from '@flyntos/provider-sdk';
import type { z } from 'zod';
import { searchInputSchema } from './search-schema';
export type SearchInput = z.infer<typeof searchInputSchema>;
export const toCanonical = (input: SearchInput): CanonicalSearchRequest => canonicalSearchRequestSchema.parse({ origin: { code: input.origin.toUpperCase(), type: 'airport', label: input.origin.toUpperCase() }, destination: { code: input.destination.toUpperCase(), type: 'airport', label: input.destination.toUpperCase() }, departureDate: input.departureDate, returnDate: input.returnDate, passengers: input.passengers ?? { adults: 1, children: 0, infants: 0 }, cabin: input.cabin ?? 'economy', locale: input.locale, market: 'US', currency: 'USD', scenario: input.scenario });
const build=(provider:'kiwi'|'amadeus',request:CanonicalSearchRequest,variant:number)=>{
const total=189+variant*39+(provider==='amadeus'?14:0);
const departureAt=request.departureDate+'T0'+(6+variant)+':15:00Z';
const arrivalAt=request.departureDate+'T1'+variant+':00:00Z';
return{
id:provider+'-'+variant,
routeSignature:request.origin.code+'-'+request.destination.code+'-'+variant,
segments:[{id:'seg-'+provider+'-'+variant,origin:request.origin.code,destination:request.destination.code,departureAt,arrivalAt,durationMinutes:210+variant*25,stops:variant%2,legs:[{id:'leg-'+provider+'-'+variant,origin:request.origin.code,destination:request.destination.code,departureAt,arrivalAt,marketingCarrier:provider==='kiwi'?'W6':'LH',flightNumber:(provider==='kiwi'?'W6':'LH')+(440+variant),durationMinutes:210+variant*25,cabin:request.cabin}]}],
offers:[{id:'offer-'+provider+'-'+variant,provider,clickoutUrl:'https://example.com/'+provider,price:{currency:request.currency,total},baggage:{summary:variant%2===0?'Checked bag included':'Carry-on only'},refundable:provider==='amadeus',selfTransfer:provider==='kiwi'&&variant===2,score:.9-variant*.05}],
baggageSummary:variant%2===0?'Checked bag included':'Carry-on only',
totalDurationMinutes:210+variant*25,stops:variant%2,rankingScore:.9-variant*.05+(provider==='amadeus'?.02:0),
bestOffer:{id:'offer-'+provider+'-'+variant,provider,clickoutUrl:'https://example.com/'+provider,price:{currency:request.currency,total},baggage:{summary:variant%2===0?'Checked bag included':'Carry-on only'},refundable:provider==='amadeus',selfTransfer:provider==='kiwi'&&variant===2,score:.9-variant*.05},
providerMetadata:[{provider,capabilities:provider==='kiwi'?['baggage','price-led']:['baggage','refund-rules'],latencyMs:provider==='kiwi'?380:520,cacheHit:false,partial:false}]};
};
class MockAdapter implements FlightProviderAdapter{constructor(readonly provider:'kiwi'|'amadeus',readonly capabilities:any){}
async search(request:CanonicalSearchRequest):Promise<ProviderSearchResult>{return{provider:this.provider,response:{id:this.provider+'-'+Date.now(),request,itineraries:[build(this.provider,request,1),build(this.provider,request,2)],diagnostics:{searchId:this.provider+'-'+Date.now(),providerCount:1,providerFailures:[],latencyMs:this.provider==='kiwi'?380:520,dedupeRatio:1,cacheStatus:'miss',notes:['mock provider']},generatedAt:new Date().toISOString()}}}
async healthCheck():Promise<ProviderHealth>{return{provider:this.provider,ok:true,latencyMs:this.provider==='kiwi'?104:132,message:'healthy'}}}
export const registry=()=>{const r=new ProviderRegistry();r.register(new MockAdapter('kiwi',{code:'kiwi',supportsBaggage:true,supportsRefundRules:false,supportsMultiCity:true,supportsBrandedFares:false,supportsSeatSelection:false}));r.register(new MockAdapter('amadeus',{code:'amadeus',supportsBaggage:true,supportsRefundRules:true,supportsMultiCity:true,supportsBrandedFares:true,supportsSeatSelection:true}));return r;};
export const runSearch=async(input:SearchInput):Promise<SearchResponse>=>{const r=registry();const request=toCanonical(input);const results=await Promise.all(r.list().map(adapter=>adapter.search(request)));const itineraries=results.flatMap(item=>item.response.itineraries).sort((a,b)=>b.rankingScore-a.rankingScore);return{id:'search-'+Date.now(),request,itineraries,diagnostics:{searchId:'diag-'+Date.now(),providerCount:results.length,providerFailures:[],latencyMs:640,dedupeRatio:1,cacheStatus:'miss',notes:['mock orchestrator response']},generatedAt:new Date().toISOString()};}
