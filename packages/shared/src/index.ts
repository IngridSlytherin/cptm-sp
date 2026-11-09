export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
}
