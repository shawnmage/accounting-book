import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '我的账本',
  description: '客户订单与财务管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  )
}
