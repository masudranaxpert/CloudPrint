'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Wrench, Play, ShoppingCart, BookOpen, Printer, Menu, X, Cloud } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'হোম', icon: Home },
    { href: '/calculator', label: 'ক্যালকুলেটর', icon: Calculator },
    { href: '/tools', label: 'PDF টুলস', icon: Wrench },
    { href: '/demos', label: 'ডেমো', icon: Play },
    { href: '/order', label: 'অর্ডার প্রক্রিয়া', icon: ShoppingCart },
    { href: '/tutorials', label: 'টিউটোরিয়াল', icon: BookOpen },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/admin1')) return null;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center border-b border-slate-200 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-3 text-xl font-extrabold text-slate-900">
                        <Cloud size={28} className="text-teal-600" />
                        CloudPrint
                    </Link>

                    {/* Desktop links */}
                    <ul className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        pathname === link.href
                                            ? 'bg-teal-50 font-semibold text-teal-700'
                                            : 'text-slate-500 hover:bg-teal-50 hover:text-teal-600'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="/calculator"
                                className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-600 hover:shadow-lg"
                            >
                                <Printer size={16} /> এখনই প্রিন্ট করুন
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile toggle */}
                    <button
                        className="flex items-center p-2 text-slate-900 md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="fixed inset-x-0 top-[72px] bottom-0 z-40 bg-white/[0.98] p-6 backdrop-blur-xl md:hidden">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-4 py-4 text-lg font-medium text-slate-900 transition-all hover:bg-teal-50 hover:text-teal-600"
                            >
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/calculator"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-3.5 text-lg font-bold text-white shadow-lg"
                        onClick={() => setMobileOpen(false)}
                    >
                        <Printer size={20} /> এখনই প্রিন্ট করুন
                    </Link>
                </div>
            )}
        </>
    );
}
