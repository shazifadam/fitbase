import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Provider } from "@/components/ui/provider"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],  // Regular, Medium, Semibold, Bold
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Fitbase - Personal Trainer Client Management",
  description: "Manage your fitness clients with ease",
  manifest: "/manifest.json",
  themeColor: "#9d174d",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
