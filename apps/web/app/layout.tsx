import type { Metadata } from 'next';
import './globals.css';
import './theme.css';
import { Footer } from '../src/components/footer';
const domain=process.env.DOMAIN&&process.env.DOMAIN!=='localhost'?`https://${process.env.DOMAIN}`:'http://localhost:3000';
export const metadata: Metadata = { metadataBase:new URL(domain),title:{default:'Situação dos Trilhos de São Paulo',template:'%s | Situação dos Trilhos'},description:'Acompanhamento independente da situação das linhas metropolitanas de São Paulo.',alternates:{canonical:'/'},openGraph:{title:'Situação dos Trilhos de São Paulo',description:'Acompanhamento independente das linhas metropolitanas.',url:'/',type:'website',locale:'pt_BR'} };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><div className="app-shell"><div className="app-content">{children}</div><Footer/></div></body></html>; }
