import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin"><span>ST</span><strong>Administração</strong></Link><nav aria-label="Administração"><Link href="/admin">Visão geral</Link><Link href="/admin/health">Saúde do sistema</Link><Link href="/">Ver site público</Link></nav></aside><main className="admin-content">{children}</main></div>;
}
