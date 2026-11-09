import { OperationalStatus } from '@prisma/client';

export interface ExternalLineStatus {
  lineCode: string;
  status: OperationalStatus;
  description?: string;
  source: string;
  sourceEventId?: string;
  sourceUpdatedAt?: Date;
}
