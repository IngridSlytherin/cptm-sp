import { StatusDashboard } from '../src/components/status-dashboard';
import { PageContainer } from '../src/components/page-container';
import { getLinesStatus } from '../src/services/lines';

export const revalidate = 60;

async function loadStatus() {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await getLinesStatus({ next: { revalidate: 60 } });
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

export default async function Home() {
  let data = null;
  let error = false;
  try { data = await loadStatus(); } catch { error = true; }
  return <PageContainer><StatusDashboard initialData={data} initialError={error} /></PageContainer>;
}
