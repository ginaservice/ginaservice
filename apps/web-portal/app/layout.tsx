import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GINASERVICE & ReferPay DAO — Antigravity Sovereign Web Portal (V2026)',
  description:
    'Unified Next.js 15 Sovereign Portal for GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1, GINA-SEC-7L-2026 7-Layer Security, DIR-5 Media Swarm, Web3 Creator Provenance, and WORM Audit Streams.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  )
}
