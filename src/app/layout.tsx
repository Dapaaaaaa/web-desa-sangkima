import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Public_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

// Serif editorial untuk judul — kesan dokumen/kop surat resmi
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

// Sans untuk teks UI — Public Sans dirancang khusus layanan publik/pemerintahan
const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

// Mono untuk nomor surat, NIK, kode — kesan registri/arsip
const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "E-Surat Desa Sangkima",
  description:
    "Layanan administrasi surat-menyurat digital Pemerintah Desa Sangkima, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
