import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QA Copilot',
  description: 'Write a test in plain English and run it against the release build.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
