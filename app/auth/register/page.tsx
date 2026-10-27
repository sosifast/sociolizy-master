"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Perhitungan kekuatan password sederhana
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (!password) return { label: "", color: "bg-slate-700", text: "text-slate-500" };
    if (strengthScore <= 2) return { label: "Lemah", color: "bg-rose-500", text: "text-rose-400" };
    if (strengthScore <= 4) return { label: "Sedang", color: "bg-amber-500", text: "text-amber-400" };
    return { label: "Kuat", color: "bg-emerald-500", text: "text-emerald-400" };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage("Silakan lengkapi semua kolom yang wajib diisi.");
      return;
    }

    if (username.length < 3) {
      setErrorMessage("Username harus minimal 3 karakter.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password harus minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok dengan password.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Anda harus menyetujui Ketentuan Layanan.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Gagal membuat akun.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(result.message || "Akun berhasil dibuat! Mengalihkan ke login...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi gangguan jaringan. Silakan coba beberapa saat lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Glow outer border card */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/40 via-slate-800/60 to-transparent shadow-2xl shadow-indigo-950/50">
        
        <div className="relative rounded-[23px] bg-[#0c1222]/90 backdrop-blur-2xl p-7 sm:p-9 border border-white/[0.06]">
          
          {/* Card Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Registrasi Akun Baru</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mulai Langkah Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Daftar gratis sekarang dan nikmati harga reseller termurah.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                  placeholder="Buat username unik (contoh: boss_smm)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Alamat Email Aktif
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Password
                </label>
                {password && (
                  <span className={`text-[11px] font-semibold ${strength.text}`}>
                    Kekuatan: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="mt-1.5 flex gap-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${Math.min(100, Math.max(20, (strengthScore / 5) * 100))}%` }}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Konfirmasi Password
                </label>
                {confirmPassword && (
                  <span className="text-[11px] flex items-center gap-1 font-medium">
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Cocok
                      </span>
                    ) : (
                      <span className="text-rose-400">Tidak cocok</span>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password Anda"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  Saya setuju dengan{" "}
                  <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                    Ketentuan Layanan
                  </Link>{" "}
                  dan Kebijakan Privasi platform.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan akun...</span>
                  </>
                ) : (
                  <>
                    <span>Buat Akun Member</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0c1222] text-slate-500 font-medium">
                Sudah memiliki akun?
              </span>
            </div>
          </div>

          {/* Login Link Button */}
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all text-center"
          >
            Masuk ke Akun Terdaftar
          </Link>

          {/* Footer security badge */}
          <div className="mt-5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pendaftaran aman dan saldo awal Rp 0</span>
          </div>

        </div>
      </div>
    </div>
  );
}
