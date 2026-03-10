import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { ToastProvider } from "@/providers/ToastProvider";
import AuthProvider from "@/providers/AuthProvider";
import { ConfirmProvider } from "@/providers/ConfirmProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beacon Scholarship 2026",
  description: "Register for the elite football talent scholarship 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        {/* Suppress MetaMask extension errors from showing up in the Next.js Error Overlay */}
        <Script id="suppress-extension-errors" strategy="beforeInteractive">
          {`
            window.addEventListener('unhandledrejection', (event) => {
              if (event.reason && (
                event.reason.message?.includes('MetaMask') || 
                event.reason.message?.includes('inpage.js') ||
                event.reason.stack?.includes('extension')
              )) {
                event.stopImmediatePropagation();
                event.preventDefault();
              }
            });
            window.addEventListener('error', (event) => {
              if (event.message?.includes('MetaMask') || 
                  event.filename?.includes('extension') ||
                  event.filename?.includes('inpage.js')) {
                event.stopImmediatePropagation();
                event.preventDefault();
              }
            }, true);
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ConfirmProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
