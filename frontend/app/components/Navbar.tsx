"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const isLoggedIn = !!session;

  return (
    <nav className="w-full bg-white border-b border-gray-200 text-black">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          JobTrcker
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/about" className="hover:text-black transition">About</Link>

          {/* Only show when logged in */}
          {isLoggedIn && (
            <>
              <Link href="/jobs" className="hover:text-black transition">Jobs</Link>
              <Link href="/dashboard" className="hover:text-black transition">Dashboard</Link>
            </>
          )}

          <span className="h-4 w-px bg-gray-200" aria-hidden="true" />

          {/* AUTH STATE */}
          {/* {status === "loading" ? null : isLoggedIn ? (
            <button
              onClick={() => signOut()}
              className="text-red-600 hover:text-red-700 transition font-medium"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/auth" 
              className="px-4 py-1.5 border border-black text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-gray-50 transition rounded-none"
            >
              Login
            </Link>
          ) } */}
        </div>

        {/* Mobile Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-2xl p-1">
          {open ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}