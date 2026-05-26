import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'MindBase',
  description: 'Your team AI workspace',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
