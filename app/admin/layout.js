'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard, ShoppingCart, Tags, BarChart3, LogOut,
    Cloud, Settings, Calculator, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const NAV_LINKS = [
    { href: '/admin1', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin1/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin1/calculations', label: 'Calculations', icon: Calculator },
    { href: '/admin1/pricing', label: 'Pricing', icon: Tags },
    { href: '/admin1/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin1/settings', label: 'Settings', icon: Settings },
];

function AdminSidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile top bar */}
            <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:hidden">
                <div className="flex items-center gap-2">
                    <Cloud className="h-6 w-6 text-teal-500" />
                    <span className="text-lg font-bold text-slate-800">CloudPrint</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20">
                        <Cloud className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-white">CloudPrint</h1>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Admin Panel</p>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-teal-500/10 text-teal-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-teal-400" />
                                )}
                                <Icon size={18} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    {/* Sign Out — right after Settings */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin1/login' })}
                        className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </aside>
        </>
    );
}

function AdminGuard({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated' && pathname !== '/admin1/login') {
            router.push('/admin1/login');
        }
    }, [status, pathname, router]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
            </div>
        );
    }

    if (pathname === '/admin1/login') {
        return <>{children}</>;
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className="flex min-h-screen flex-col md:pl-64">
                {/* Desktop top bar */}
                <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 md:flex">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-800">Admin</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="capitalize text-slate-600">
                            {pathname.split('/').pop() || 'Dashboard'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                            <Bell size={18} />
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-500" />
                        </button>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-bold text-white shadow-sm">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 pt-[72px] md:p-8 md:pt-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <SessionProvider>
            <AdminGuard>{children}</AdminGuard>
        </SessionProvider>
    );
}
