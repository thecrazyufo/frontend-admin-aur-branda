"use client";

import Link from"next/link";
import { useState, useEffect } from"react";
import { Menu, X, ChevronDown, Search, Download, Phone } from"lucide-react";
import { mainNav } from"@/config/nav";
import { siteConfig } from"@/config/site";

export default function Navbar() {
 const [isOpen, setIsOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

 useEffect(() => {
 const handleScroll = () => setScrolled(window.scrollY > 20);
 window.addEventListener("scroll", handleScroll);
 return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 return (
 <>
 {/* Top bar */}
 <div className="bg-[var(--navy-900)] text-gray-300 text-sm py-2 hidden md:block">
 <div className="container-custom flex items-center justify-between">
 <span className="flex items-center gap-2">
 <Phone size={13} />
 {siteConfig.phone}
 </span>
 <div className="flex items-center gap-6">
 <span>30-Day Money-Back Guarantee</span>
 <span>•</span>
 <span>Free Trial Available</span>
 <span>•</span>
 <Link href="/contact" className="text-amber-400 hover:text-amber-300 font-medium">
 24/7 Support
 </Link>
 </div>
 </div>
 </div>

 {/* Main navbar */}
 <nav
 className={`sticky top-0 z-50 transition-all duration-300 ${
 scrolled
 ?"bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
 :"bg-white border-b border-gray-100"
 }`}
 >
 <div className="container-custom">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <Link href="/" className="flex items-center gap-2 group">
 <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
 <span className="text-white font-bold text-base">D</span>
 </div>
 <div>
 <span className="font-bold text-gray-900 text-lg leading-none">
 Data<span className="text-blue-600">Migrate</span>
 </span>
 <span className="text-blue-600 font-bold text-lg leading-none"> Pro</span>
 </div>
 </Link>

 {/* Desktop Nav */}
 <div className="hidden lg:flex items-center gap-1">
 {mainNav.map((item) => (
 <div
 key={item.href}
 className="relative"
 onMouseEnter={() => item.children && setActiveDropdown(item.label)}
 onMouseLeave={() => setActiveDropdown(null)}
 >
 <Link
 href={item.href}
 className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
 activeDropdown === item.label
 ?"text-blue-600 bg-blue-50"
 :"text-gray-700 hover:text-blue-600 hover:bg-blue-50"
 }`}
 >
 {item.label}
 {item.children && <ChevronDown size={14} className={`transition-transform ${activeDropdown === item.label ?"rotate-180" :""}`} />}
 </Link>

 {/* Dropdown */}
 {item.children && activeDropdown === item.label && (
 <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
 {item.children.map((child) => (
 <Link
 key={child.href}
 href={child.href}
 className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
 >
 {child.label}
 </Link>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>

 {/* CTA Buttons */}
 <div className="hidden lg:flex items-center gap-3">
 <Link
 href="/search"
 className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
 aria-label="Search"
 >
 <Search size={18} />
 </Link>
 <Link href="/download" className="btn btn-outline text-sm py-2 px-4">
 <Download size={15} />
 Free Trial
 </Link>
 <Link href="/products" className="btn btn-primary text-sm py-2 px-4">
 View Products
 </Link>
 </div>

 {/* Mobile menu button */}
 <button
 className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
 onClick={() => setIsOpen(!isOpen)}
 aria-label="Toggle menu"
 >
 {isOpen ? <X size={22} /> : <Menu size={22} />}
 </button>
 </div>
 </div>

 {/* Mobile Menu */}
 {isOpen && (
 <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
 {mainNav.map((item) => (
 <div key={item.href}>
 <Link
 href={item.href}
 className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
 onClick={() => setIsOpen(false)}
 >
 {item.label}
 </Link>
 {item.children && (
 <div className="ml-4 border-l-2 border-blue-100 pl-3 mt-1 space-y-1">
 {item.children.map((child) => (
 <Link
 key={child.href}
 href={child.href}
 className="block py-2 text-xs text-gray-500 hover:text-blue-600"
 onClick={() => setIsOpen(false)}
 >
 {child.label}
 </Link>
 ))}
 </div>
 )}
 </div>
 ))}
 <div className="pt-4 flex flex-col gap-2">
 <Link href="/download" className="btn btn-outline w-full justify-center">
 <Download size={15} />
 Free Trial
 </Link>
 <Link href="/products" className="btn btn-primary w-full justify-center">
 View Products
 </Link>
 </div>
 </div>
 )}
 </nav>
 </>
 );
}
