"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Logika menangkap error validasi berlapis (Zod / Express Validator)
        if (response.status === 400 && data.errors) {
          const firstField = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstField]?.[0] ?? data.message;
          throw new Error(firstMsg || "Data yang dimasukkan tidak valid");
        }
        throw new Error(data.message || "Gagal masuk ke akun Anda");
      }

      // Memicu Toast Sukses Mini di Pojok Kanan Atas
      toast("Selamat datang kembali! Mengalihkan ke sistem...", "Sistem Terverifikasi", "success", 4000);
      
      // Delay tipis agar user sempat melihat efek sukses toast sebelum pindah page
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      
      // 🔥 REVISI BERSIH: Langsung menembak jalur context utama tanpa bypass objek window browser
      toast(msg, "Validasi Gagal", "error", 5000);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 💡 Pembungkus Paling Luar: Menggunakan min-h-screen untuk memastikan latar belakang #EEEEEE memenuhi layar di semua OS
    <main className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center px-5 py-10 md:px-10 lg:py-0 font-sans select-none">
      
      {/* 📦 WADAH STRUKTUR KONSISTEN (WRAPPER CONTAINER):
          Mengunci batas maksimal lebar konten luar agar judul dan card putih selalu sejajar tegak lurus (kiri-kanan) di semua device.
      */}
      <div className="w-full flex flex-col gap-6 items-start
        md:max-w-[680px]
        lg:max-w-[900px]
        xl:max-w-[1100px]
        2xl:max-w-[1250px]">

        {/* 1. Teks Judul Aplikasi Pojok Kiri Atas (Fluid Clamp Scale) */}
        {/* 💡 Konsistensi Luar Card: Menggunakan posisi statis dengan text-left agar murni berada di luar card tanpa risiko menindih, dengan margin-left (ml-1) agar sejajar dengan lengkungan boks di bawahnya */}
        <h1 className="text-black font-extrabold text-left transition-all duration-300 w-full ml-1
          text-xl md:text-2xl lg:text-[clamp(1.5rem,2.5vw,2.25rem)]">
          E-Surat Desa Yang Akan Dituju
        </h1>

        {/* 2. Kotak Card Utama Login (Sizing Adaptif untuk Monitor PC Besar) */}
        {/* 💡 Perbaikan Lebar: Menggunakan w-full agar lebarnya otomatis membesar mengikuti batas max-w milik kontainer luar di atas */}
        <div className="w-full bg-white rounded-[20px] p-6 shadow-sm flex flex-col gap-5 items-center z-10 transition-all duration-300
          md:p-[30px] md:gap-6 md:flex-row
          lg:p-12 lg:gap-12
          xl:p-16 xl:gap-16">

          {/* Sisi Kiri: Wadah Ilustrasi Gambar Vektor */}
          <div className="w-full flex justify-center items-center md:flex-1">
            <div className="relative w-[160px] h-[120px] transition-all duration-300
              md:w-[220px] md:h-[180px] 
              lg:w-[340px] lg:h-[260px] 
              xl:w-[420px] xl:h-[320px]
              2xl:w-[480px] 2xl:h-[360px]">
              <Image 
                src="/undraw_subscribe_w8sz.svg"
                alt="Ilustrasi Login E-Surat"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Sisi Kanan: Form Konten Utama */}
          <div className="w-full flex flex-col md:flex-1">
            <h2 className="text-black font-extrabold text-center text-sm mb-5 md:text-left md:text-base md:mb-6 lg:text-[clamp(1.1rem,1.8vw,1.6rem)]">
              Silahkan masuk sesuai akun anda
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col lg:gap-2">
              
              {/* Input Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-black text-sm font-bold mb-1.5 lg:text-base">
                  Email
                </label>
                <input 
                  type="email"
                  id="email"
                  placeholder="Masukan Email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#E1E1E1] border-none rounded-lg py-3 px-4 text-xs text-black outline-none placeholder-[#797979] lg:text-sm lg:py-4 transition-all focus:ring-2 focus:ring-[#70C7FF]/40"
                  autoComplete="email"
                />
              </div>

              {/* Input Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-black text-sm font-bold mb-1.5 lg:text-base">
                  Password
                </label>
                <input 
                  type="password"
                  id="password"
                  placeholder="Masukan Password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#E1E1E1] border-none rounded-lg py-3 px-4 text-xs text-black outline-none placeholder-[#797979] lg:text-sm lg:py-4 transition-all focus:ring-2 focus:ring-[#70C7FF]/40"
                />
              </div>

              {/* Aksi Lupa Sandi */}
              <div className="text-right mb-5 lg:mb-6">
                <a href="/forgot-password" className="text-xs font-bold text-[#009FFF] hover:underline lg:text-sm">
                  Lupa Sandi?
                </a>
              </div>

              {/* Tombol Eksekusi Submit */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#70C7FF] text-black border-none rounded-lg py-3 text-sm font-bold text-center transition-all duration-200 hover:bg-[#5bc0ff] disabled:opacity-70 disabled:cursor-not-allowed lg:py-4 lg:text-base active:scale-[0.99]"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>

              {/* Pendaftaran Akun Baru */}
              <div className="text-center mt-4 text-xs text-[#777777] lg:text-sm lg:mt-6">
                Belum punya akun?{" "}
                <a href="/register" className="font-bold text-[#009FFF] hover:underline">
                  Daftar
                </a>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}