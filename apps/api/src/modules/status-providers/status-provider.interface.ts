import { ExternalLineStatus } from './status-provider.types';

export const STATUS_PROVIDER = Symbol('STATUS_PROVIDER');
export interface StatusProvider {
  providerName: string;
  fetchStatuses(): Promise<ExternalLineStatus[]>;
}
