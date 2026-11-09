export function PageContainer({children,className=''}:{children:React.ReactNode;className?:string}){return <main className={`page-container ${className}`.trim()}>{children}</main>}
