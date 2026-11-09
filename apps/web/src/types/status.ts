export type OperationalStatus='NORMAL'|'REDUCED_SPEED'|'PARTIAL_OPERATION'|'INTERRUPTED'|'CLOSED'|'PLANNED_MAINTENANCE'|'UNKNOWN';
export type Freshness='fresh'|'stale'|'unavailable'|'source_error';
export interface LineStatus {code:string;number:string;name:string;operator:string;color:string|null;status:OperationalStatus;statusLabel:string;description:string|null;source:string|null;sourceUpdatedAt:string|null;lastCollectedAt:string|null;freshness:Freshness;}
export interface LinesStatusResponse {data:LineStatus[];meta:{lastSuccessfulCollection:string|null;provider:string;sourceState:'available'|'error'|'unavailable'}}
export interface StatusEvent {id:string;status:OperationalStatus;description:string|null;source:string;collectedAt:string;startedAt:string|null;endedAt:string|null;}
export interface LineDetail extends LineStatus {events:StatusEvent[];}
