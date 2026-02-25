import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Pompa Teknik Market - Endüstriyel Pompa ve Yedek Parça',
    template: '%s | Pompa Teknik Market',
  },
  description:
    'Endüstriyel pompa, santrifüj pompa, dalgıç pompa ve tüm pompa yedek parçaları. Hızlı teslimat, garantili ürünler.',
  keywords: ['pompa', 'endüstriyel pompa', 'santrifüj pompa', 'dalgıç pompa', 'yedek parça'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
