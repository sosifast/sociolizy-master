"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  Check,
  Globe,
  ChevronDown,
} from "lucide-react";
import { posthog } from "@/lib/posthog-client";

interface ServerRegionOption {
  code: string;
  name: string;
  flag: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverArea, setServerArea] = useState("SG");
  const [regions, setRegions] = useState<ServerRegionOption[]>([
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "DC", name: "United States (Washington DC)", flag: "🇺🇸" },
    { code: "BOMB", name: "India (Mumbai)", flag: "🇮🇳" },
    { code: "SYD", name: "Australia (Sydney)", flag: "🇦🇺" },
    { code: "SF", name: "United States (San Francisco)", flag: "🇺🇸" },
    { code: "PDX", name: "United States (Portland)", flag: "🇺🇸" },
  ]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
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
    if (strengthScore <= 2) return { label: "Weak", color: "bg-rose-500", text: "text-rose-400" };
    if (strengthScore <= 4) return { label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  };

  const strength = getStrengthLabel();

  // Fetch dynamic active server regions from .env via /api/auth/register
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRegions(true);
    fetch("/api/auth/register")
      .then((res) => res.json())
      .then((res) => {
        if (isMounted && res.success && res.data?.regions?.length > 0) {
          setRegions(res.data.regions);
          if (res.data.defaultRegion) {
            setServerArea(res.data.defaultRegion);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic server regions:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRegions(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (username.length < 3) {
      setErrorMessage("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service.");
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
          server_area: serverArea,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to login...");

      try {
        posthog.capture("user_registered", {
          username,
          email,
          server_area: serverArea,
        });
      } catch {}

      setTimeout(() => {
        router.push("/auth/login");
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Please try again in a few moments.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto">
      {/* Outer glow card */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/40 via-slate-800/60 to-transparent shadow-2xl shadow-indigo-950/50">
        <div className="relative rounded-[23px] bg-[#0c1222]/95 backdrop-blur-2xl p-6 sm:p-7 border border-white/[0.06]">
          {/* Card Header */}
          <div className="mb-4 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign up to start placing orders and managing services
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
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
                  placeholder="Choose a username (e.g. johndoe)"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Email Address
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
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
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
                  <span className={`text-[10px] font-semibold ${strength.text}`}>
                    Strength: {strength.label}
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                <div className="mt-1 flex gap-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
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
                  Confirm Password
                </label>
                {confirmPassword && (
                  <span className="text-[10px] flex items-center gap-1 font-medium">
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Matches
                      </span>
                    ) : (
                      <span className="text-rose-400">Does not match</span>
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
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Server Region Selector */}
            <div>
              <label
                htmlFor="serverArea"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Server Location (Region)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <select
                  id="serverArea"
                  value={serverArea}
                  onChange={(e) => setServerArea(e.target.value)}
                  disabled={isLoadingRegions}
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-sm text-white bg-slate-900/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all cursor-pointer appearance-none"
                >
                  {regions.map((reg) => (
                    <option key={reg.code} value={reg.code} className="bg-slate-900 text-white py-1.5">
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="pt-0.5">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-0"
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  I agree to the{" "}
                  <Link
                    href="/page/policy"
                    target="_blank"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Terms
                  </Link>{" "}
                  &amp;{" "}
                  <Link
                    href="/page/privacy"
                    target="_blank"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-2.5 bg-[#0c1222] text-slate-500 font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link Button */}
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all text-center"
          >
            Sign In Instead
          </Link>

          {/* Footer security badge */}
          <div className="mt-3 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure registration &amp; instant account activation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
