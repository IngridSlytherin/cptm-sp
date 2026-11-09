import Link from 'next/link';

export default function AdminPage() { return <section className="admin-page"><p className="eyebrow">Painel administrativo</p><h1>Visão geral</h1><p className="admin-lead">Ferramentas internas para acompanhar a operação da plataforma.</p><div className="admin-grid"><Link href="/admin/health"><span>Infraestrutura</span><strong>Saúde do sistema</strong><small>API, banco de dados e cache</small></Link><Link href="/"><span>Experiência pública</span><strong>Visualizar o site</strong><small>Confira a página como um visitante</small></Link></div></section>; }
