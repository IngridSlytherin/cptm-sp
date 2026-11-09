import { apiGet } from './api';
import type { LineDetail,LinesStatusResponse } from '../types/status';
export const getLinesStatus=(options?:RequestInit)=>apiGet<LinesStatusResponse>('/lines/status',options);
export const getLine=(code:string,options?:RequestInit)=>apiGet<LineDetail>(`/lines/${encodeURIComponent(code)}`,options);
