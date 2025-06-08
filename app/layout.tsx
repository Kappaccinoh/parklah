import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SubscriptionProvider } from "@/lib/subscriptionContext"
import BasePathProvider from "./BasePath"
import MobileWrapper from "@/components/MobileWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ParkEasy Malaysia - Find Parking in KL",
  description: "Find available parking spaces in Kuala Lumpur and Malaysia",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* This ensures the correct base path is set for GitHub Pages */}
        <meta name="base-path" content="/parklah" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {/* Client component that sets the base href dynamically */}
        <BasePathProvider />
        <SubscriptionProvider>
          <MobileWrapper>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </MobileWrapper>
        </SubscriptionProvider>
      </body>
    </html>
  )
}
