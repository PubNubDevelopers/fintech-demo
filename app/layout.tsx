import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'PubNub FinTech Demo',
  description:
    'FinTech (Financial Technology) Demo showing how PubNub can enhance your FinTech app with Real-Time features to create a more engaging user experience.  Written in Next.js with the PubNub Chat SDK.'
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <Suspense>
        <body className={poppins.className}>{children}</body>
      </Suspense>
    </html>
  )
}
