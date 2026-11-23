import './admin.css';
export const metadata={title:'Halal Sheba | Administration',robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}) {return <div className="admin-root">{children}</div>;}
