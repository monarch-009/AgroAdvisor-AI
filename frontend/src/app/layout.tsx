import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "AgroAdvisor AI — Smart Crop Advisory System",
  description:
    "AI-powered crop recommendation and plant disease detection system for farmers. Get personalized crop advice based on soil and climate data.",
};

// Force cache refresh for modernized regional analysis v2.1

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#16a34a', // green-600
          colorBackground: '#ffffff',
          colorText: '#111827',
          colorInputBackground: '#f9fafb',
          colorInputText: '#111827',
          borderRadius: '1rem', // rounded-2xl to match existing UI
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        elements: {
          card: 'shadow-2xl shadow-green-900/5 border border-gray-100',
          formButtonPrimary: 'bg-green-600 hover:bg-green-700 font-bold',
          socialButtonsBlockButton: 'font-bold border border-gray-200 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'font-bold',
          footerActionLink: 'text-green-600 hover:text-green-700 font-bold',
          modalBackdrop: 'bg-gray-900/50 backdrop-blur-sm',
        }
      }}
    >
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
