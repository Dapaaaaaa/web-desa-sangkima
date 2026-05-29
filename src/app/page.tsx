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
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          const firstField = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstField]?.[0] ?? data.message;
          throw new Error(firstMsg || data.message || "Terjadi kesalahan saat login");
        }
        throw new Error(data.message || "Terjadi kesalahan saat login");
      }

      toast("Login berhasil", "Sukses", "success");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      try {
        toast(msg, "Login gagal", "error");
      } catch (_) {
        if (typeof window !== "undefined" && window.showToast) {
          window.showToast({ message: msg, title: "Login gagal", type: "error" });
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#EEEEEE] flex flex-col justify-start pt-[120px] px-5 pb-10 items-center md:pt-[140px] md:px-10 lg:justify-center lg:pt-0 font-sans">
      <h1 className="absolute text-black font-extrabold text-center transition-all duration-300
        top-10 left-5 right-5 text-xl
        md:left-10 md:right-auto md:text-2xl
        lg:top-[6%] lg:left-[8%] lg:text-[clamp(1.5rem,2.5vw,2.25rem)] lg:text-left">
        E-Surat Desa Yang Akan Dituju
      </h1>

      <div className="w-full bg-white rounded-[20px] p-6 shadow-sm flex flex-col gap-5 items-center z-10 transition-all duration-300
        md:max-w-[680px] md:p-[30px] md:gap-6 md:flex-row
        lg:max-w-[900px] lg:p-12 lg:gap-12
        xl:max-w-[1100px] xl:p-16 xl:gap-16
        2xl:max-w-[1250px]">

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

        <div className="w-full flex flex-col md:flex-1">
          <h2 className="text-black font-extrabold text-center text-sm mb-4 md:text-left md:text-base md:mb-6 lg:text-[clamp(1.1rem,1.8vw,1.6rem)]">
            Silahkan masuk sesuai akun anda
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col lg:gap-2">
            <div className="mb-4">
              <label htmlFor="email" className="block text-black text-sm font-bold mb-1.5 lg:text-base">Email</label>
              <input 
                type="email"
                id="email"
                placeholder="Masukan Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#E1E1E1] border-none rounded-lg py-3 px-4 text-xs text-black outline-none placeholder-[#797979] lg:text-sm lg:py-4"
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-black text-sm font-bold mb-1.5 lg:text-base">Password</label>
              <input 
                type="password"
                id="password"
                placeholder="Masukan Password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#E1E1E1] border-none rounded-lg py-3 px-4 text-xs text-black outline-none placeholder-[#797979] lg:text-sm lg:py-4"
              />
            </div>

            <div className="text-right mb-5 lg:mb-6">
              <a href="/forgot-password" className="text-xs font-bold text-[#00A3FF] hover:underline lg:text-sm">Lupa Sandi?</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#70C7FF] text-black border-none rounded-lg py-3 text-sm font-bold text-center transition-all duration-200 hover:bg-[#5bc0ff] disabled:opacity-70 disabled:cursor-not-allowed lg:py-4 lg:text-base"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>

            <div className="text-center mt-4 text-xs text-[#777777] lg:text-sm lg:mt-6">
              Belum punya akun? <a href="/register" className="font-bold text-[#00A3FF] hover:underline">Daftar</a>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}
