"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat login");
      }

      router.push("/dashboard"); 
    } catch (err: any) {
      setError(err.message || "Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#EEEEEE] flex flex-col justify-start pt-[120px] px-5 pb-10 items-center md:pt-[140px] md:px-10 lg:justify-center lg:pt-0 font-sans">
      
      {/* 1. Teks Judul Pojok Kiri Atas (Responsif di 3 Skala) */}
      <h1 className="absolute text-black font-extrabold text-center transition-all duration-300
        top-10 left-5 right-5 text-xl
        md:left-10 md:right-auto md:text-2xl
        lg:top-[80px] lg:left-[120px] lg:text-2xl lg:text-left">
        E-Surat Desa Yang Akan Dituju
      </h1>

      {/* 2. Kotak Card Utama Login (Responsif di 3 Skala) */}
      <div className="w-full bg-white rounded-[20px] p-6 shadow-sm flex flex-col gap-5 items-center z-10 transition-all duration-300
        md:max-w-[680px] md:p-[30px] md:gap-6 md:flex-row
        lg:max-w-[800px] lg:p-10 lg:gap-10">
        
        {/* Sisi Kiri: Tempat SVG Asli Kamu */}
        <div className="w-full flex justify-center items-center md:flex-1">
          <div className="relative w-[160px] h-[120px] md:w-[220px] md:h-[160px] lg:w-[280px] lg:h-[200px]">
            <Image 
              src="./undraw_subscribe_w8sz.svg" // Mengarah ke folder public/
              alt="Ilustrasi Login E-Surat"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Sisi Kanan: Form Konten */}
        <div className="w-full flex flex-col md:flex-1">
          <h2 className="text-black font-extrabold text-center text-sm mb-4 md:text-left md:text-base md:mb-6 lg:text-lg">
            Silahkan masuk sesuai akun anda
          </h2>
          
          {error && (
            <div className="bg-[#FFD2D2] text-[#D8000C] p-2.5 rounded-md text-xs mb-[15px] font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Input Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-black text-sm font-bold mb-1.5">
                Username
              </label>
              <input 
                type="text" 
                id="username" 
                placeholder="Masukan Username Anda" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#E0E0E0] border-none rounded-lg py-3 px-4 text-xs text-black outline-none placeholder-[#777777]"
                autoComplete="off"
              />
            </div>
            
            {/* Input Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-black text-sm font-bold mb-1.5">
                Password
              </label>
              <input 
                type="password" 
                id="password" 
                placeholder="Masukan Password Anda" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#E0E0E0] border-none rounded-lg py-3 px-4 text-xs text-black outline-none placeholder-[#777777]"
              />
            </div>

            {/* Lupa Sandi */}
            <div className="text-right mb-5">
              <a href="/forgot-password" className="text-xs font-bold text-[#00A3FF] hover:underline">
                Lupa Sandi?
              </a>
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#70C7FF] text-black border-none rounded-lg py-3 text-sm font-bold text-center transition-all duration-200 hover:bg-[#5bc0ff] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>

            {/* Link Daftar */}
            <div className="text-center mt-4 text-xs text-[#777777]">
              Belum punya akun?{" "}
              <a href="/register" className="font-bold text-[#00A3FF] hover:underline">
                Daftar
              </a>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}