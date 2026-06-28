import './globals.css'; import { Providers } from '@/components/providers'; import { Nav } from '@/components/nav';
export const metadata={title:'Our Wedding Memories',description:'A private, elegant wedding photo and video gallery'};
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="en" suppressHydrationWarning><body><Providers><Nav/>{children}</Providers></body></html>; }
