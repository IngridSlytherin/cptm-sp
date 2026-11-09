import type { OperationalStatus } from '../types/status';
const icons:Record<OperationalStatus,string>={NORMAL:'✓',REDUCED_SPEED:'!',PARTIAL_OPERATION:'!',INTERRUPTED:'×',CLOSED:'■',PLANNED_MAINTENANCE:'⚒',UNKNOWN:'?'};
export function StatusIcon({status}:{status:OperationalStatus}){return <span className="status-icon" aria-hidden="true">{icons[status]}</span>}
