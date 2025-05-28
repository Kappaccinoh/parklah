import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import BasePathProvider from "./BasePath"

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
      </head>
      <body className={inter.className}>
        {/* Client component that sets the base href dynamically */}
        <BasePathProvider />
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  )
}
