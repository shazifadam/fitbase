import type { Metadata } from "next";
import { Provider } from "@/components/ui/provider"
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fitbase - Personal Trainer Management",
  description: "Manage your personal training clients efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
