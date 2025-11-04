import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"
import {Providers} from "../src/store/providers"
import SignalRProvider from "./providers/SignalRProvider";
import { Toaster } from "react-hot-toast";
export const metadata: Metadata = {
  title: "أثراء",
  description: "منصة مستقبلية لمشاركة المحتوى والأبحاث",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
         <Providers> 
          <Suspense fallback={<div>Loading...</div>}>
       
          <Toaster 
          position="top-right"
          toastOptions={{ duration: 5000 }}
        />
            <div className="gradient-bg min-h-screen">{children}</div>

          </Suspense>
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}


