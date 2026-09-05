// Lightweight development limiter. For production, replace with a shared store
// (e.g. Redis/Upstash) so limits work across multiple instances.
const buckets = new Map<string,{count:number;reset:number}>();
export function rateLimit(key:string, limit=30, windowMs=60_000){const now=Date.now();const current=buckets.get(key);if(!current||current.reset<=now){buckets.set(key,{count:1,reset:now+windowMs});return {ok:true,retryAfter:0}}current.count+=1;return {ok:current.count<=limit,retryAfter:Math.ceil((current.reset-now)/1000)}}
