import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HypeHub — Marketing AI Platform',
  description: 'Plataforma interna de agentes de IA para marketing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ background: '#0f1117', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  )
}
