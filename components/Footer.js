'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, MessageCircle, Send } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();
    const [contacts, setContacts] = useState({ whatsappNumber: '8801XXXXXXXXX', telegramUsername: 'cloudprint_bd' });

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => setContacts(data))
            .catch(() => {});
    }, []);

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/admin1')) return null;

    return (
        <footer className="bg-slate-900 pb-8 pt-16 text-slate-300">
            <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 px-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Brand */}
                <div>
                    <h3 className="mb-3 flex items-center gap-2.5 text-2xl font-bold text-white">
                        <Cloud size={28} /> CloudPrint
                    </h3>
                    <p className="text-sm leading-7 text-slate-400">
                        বাংলাদেশের সবচেয়ে সহজ এবং সাশ্রয়ী অনলাইন প্রিন্টিং সেবা। আপনার PDF আপলোড করুন, দাম জানুন, এবং ঘরে বসে অর্ডার করুন।
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="mb-4 text-base font-semibold text-white">দ্রুত লিংক</h4>
                    <ul className="flex flex-col gap-3">
                        <li><Link href="/calculator" className="text-sm text-slate-400 transition-colors hover:text-teal-400">প্রাইস ক্যালকুলেটর</Link></li>
                        <li><Link href="/tools" className="text-sm text-slate-400 transition-colors hover:text-teal-400">PDF টুলস</Link></li>
                        <li><Link href="/demos" className="text-sm text-slate-400 transition-colors hover:text-teal-400">ডেমো গ্যালারি</Link></li>
                        <li><Link href="/tutorials" className="text-sm text-slate-400 transition-colors hover:text-teal-400">টিউটোরিয়াল</Link></li>
                    </ul>
                </div>

                {/* PDF Tools */}
                <div>
                    <h4 className="mb-4 text-base font-semibold text-white">PDF টুলস</h4>
                    <ul className="flex flex-col gap-3">
                        <li><Link href="/tools/compress" className="text-sm text-slate-400 transition-colors hover:text-teal-400">PDF কম্প্রেস</Link></li>
                        <li><Link href="/tools/merge" className="text-sm text-slate-400 transition-colors hover:text-teal-400">PDF মার্জ</Link></li>
                        <li><Link href="/tools/split" className="text-sm text-slate-400 transition-colors hover:text-teal-400">PDF স্প্লিট</Link></li>
                        <li><Link href="/tools/invert" className="text-sm text-slate-400 transition-colors hover:text-teal-400">ব্যাকগ্রাউন্ড ইনভার্ট</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="mb-4 text-base font-semibold text-white">যোগাযোগ</h4>
                    <ul className="flex flex-col gap-3">
                        <li>
                            <a href={`https://wa.me/${contacts.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-teal-400">
                                <MessageCircle size={16} /> WhatsApp-এ যোগাযোগ
                            </a>
                        </li>
                        <li>
                            <a href={`https://t.me/${contacts.telegramUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-teal-400">
                                <Send size={16} /> Telegram-এ যোগাযোগ
                            </a>
                        </li>
                        <li><Link href="/order" className="text-sm text-slate-400 transition-colors hover:text-teal-400">অর্ডার প্রক্রিয়া</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom */}
            <div className="mx-auto mt-12 flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-slate-800 px-6 pt-8 text-sm text-slate-500 sm:flex-row">
                <p>© {new Date().getFullYear()} CloudPrint। সর্বস্বত্ব সংরক্ষিত।</p>
                <p>বাংলাদেশে তৈরি ❤️</p>
            </div>
        </footer>
    );
}
