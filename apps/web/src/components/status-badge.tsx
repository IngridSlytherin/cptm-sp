import type { OperationalStatus } from '../types/status';
import { StatusIcon } from './status-icon';
const tone:Record<OperationalStatus,'success'|'warning'|'critical'|'neutral'>={NORMAL:'success',REDUCED_SPEED:'warning',PARTIAL_OPERATION:'warning',PLANNED_MAINTENANCE:'warning',INTERRUPTED:'critical',CLOSED:'critical',UNKNOWN:'neutral'};
export function StatusBadge({status,label}:{status:OperationalStatus;label:string}){return <span className={`status-badge badge-${tone[status]}`}><StatusIcon status={status}/><span>{label}</span></span>}
