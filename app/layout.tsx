import './globals.css'

export const metadata = {
  title: 'Śpiewnik Online',
  description: 'Prywatny śpiewnik zespołowy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pl"><body>{children}</body></html>
}
