'use client';
import { useEffect, useState } from 'react';
import type { HealthResponse } from '@rail-status/shared';
import { AlertBanner } from '../../../src/components/alert-banner';

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null); const [error, setError] = useState(false);
  useEffect(() => { const controller = new AbortController(); const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'; fetch(`${apiUrl}/health`, { signal: controller.signal }).then(async response => { if (!response.ok) throw new Error('API indisponível'); setHealth(await response.json() as HealthResponse); }).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true); }); return () => controller.abort(); }, []);
  return <section className="admin-page"><p className="eyebrow">Infraestrutura</p><h1>Saúde do sistema</h1><p className="admin-lead">Estado atual dos serviços essenciais da plataforma.</p>{error ? <AlertBanner title="API indisponível" tone="error">Não foi possível consultar a saúde da infraestrutura.</AlertBanner> : health ? <div className="health-grid"><div><span>API</span><strong className={health.status === 'ok' ? 'health-ok' : 'health-error'}>{health.status === 'ok' ? 'Operacional' : 'Degradada'}</strong></div><div><span>PostgreSQL</span><strong className={health.database === 'connected' ? 'health-ok' : 'health-error'}>{health.database === 'connected' ? 'Conectado' : 'Indisponível'}</strong></div><div><span>Redis</span><strong className={health.redis === 'connected' ? 'health-ok' : 'health-error'}>{health.redis === 'connected' ? 'Conectado' : 'Indisponível'}</strong></div></div> : <div className="health-loading"><span className="spinner" /><p>Verificando serviços…</p></div>}</section>;
}
