"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Helper to check active state
  const isActive = (path) => pathname === path;

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-6 sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      
      {/* Clickable Logo with Gradient */}
      <Link href="/">
        <h1 className="text-2xl font-bold tracking-wide cursor-pointer bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          FINWISE
        </h1>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-6 md:gap-8 font-medium text-sm md:text-base">
        <NavLink href="/" label="Home" active={isActive("/")} />
        <NavLink href="/about" label="About" active={isActive("/about")} />
        <NavLink href="/contact" label="Contact" active={isActive("/contact")} />
      </div>

    </nav>
  );
}

// Simple Helper Component for Links
function NavLink({ href, label, active }) {
  return (
    <Link 
      href={href} 
      className={`transition-colors duration-200 ${
        active ? "text-blue-400" : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}