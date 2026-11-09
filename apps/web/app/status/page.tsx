import Link from 'next/link';
import { PageContainer } from '../../src/components/page-container';
export default function StatusPage() { return <PageContainer className="utility-page"><div className="empty-state"><h1>Status das linhas</h1><p>A situação completa das linhas está disponível na visão geral.</p><Link className="primary-link" href="/">Acessar visão geral</Link></div></PageContainer>; }
