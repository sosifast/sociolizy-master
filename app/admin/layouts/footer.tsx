import React from "react";

export default function AdminFooter() {
  return (
    <footer className="py-3 px-6 text-[11px] text-slate-400 text-center border-t border-slate-100 bg-white">
      &copy; {new Date().getFullYear()} Admin Panel
    </footer>
  );
}
