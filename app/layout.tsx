import './globals.css'

export const metadata = {
  title: 'Zespół Pieśni i Tańca Dąbrowica – Śpiewnik',
  description: 'Śpiewnik Zespołu Pieśni i Tańca Dąbrowica',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pl"><body>{children}</body></html>
}
