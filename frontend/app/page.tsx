"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard"); // Automatically skip the landing page
    }
  }, [status, router]);

  if (status === "loading") {
    return null; // Prevents the login panel from flashing briefly on refresh
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
    </main>
  );
}