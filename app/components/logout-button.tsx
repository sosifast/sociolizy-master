"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { resetPostHogUser } from "@/lib/posthog-client";

interface LogoutButtonProps {
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
  title?: string;
  showIcon?: boolean;
}

export default function LogoutButton({
  className = "inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium cursor-pointer",
  iconClassName = "w-3.5 h-3.5",
  children,
  title = "Keluar dari akun",
  showIcon = true,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      resetPostHogUser();
      // Perform a full hard navigation to /auth/login so that
      // cookies, React state, and Next.js router caches are completely reset.
      window.location.href = "/auth/login";
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      title={title}
      className={className}
    >
      {isLoggingOut ? (
        <Loader2 className={`${iconClassName} animate-spin`} />
      ) : (
        showIcon && <LogOut className={iconClassName} />
      )}
      {children}
    </button>
  );
}

