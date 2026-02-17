'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, DollarSign, Monitor, MessageCircle, CloudUpload, Shield, FileText, Calculator, Send, Sparkles } from 'lucide-react';

export default function Home() {
    const [contacts, setContacts] = useState({ whatsappNumber: '8801XXXXXXXXX', telegramUsername: 'cloudprint_bd' });
    const [pricing, setPricing] = useState({ blackWhitePerPage: null, colorPerPage: null });

    useEffect(() => {
        fetch('/api/settings').then((r) => r.json()).then((d) => setContacts(d)).catch(() => {});
        fetch('/api/pricing').then((r) => r.json()).then((d) => { if (d.blackWhitePerPage) setPricing(d); }).catch(() => {});
    }, []);

    const bwPrice = pricing.blackWhitePerPage ?? '...';
    const colorPrice = pricing.colorPerPage ?? '...';

    const features = [
        { icon: FileText, title: 'স্বয়ংক্রিয় পৃষ্ঠা গণনা', desc: 'PDF আপলোড করলেই পৃষ্ঠা সংখ্যা স্বয়ংক্রিয়ভাবে গণনা হয়ে যাবে। আর নিজে গুনতে হবে না!', color: 'text-teal-600', bg: 'bg-teal-50' },
        { icon: DollarSign, title: 'তাৎক্ষণিক মূল্য', desc: 'B&W, কালার, slides per page — সব অপশন সিলেক্ট করুন এবং তাৎক্ষণিক সঠিক দাম জানুন।', color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: Monitor, title: 'একসাথে অনেক PDF', desc: '১০-২০টি PDF একসাথে অ্যাড করুন, প্রতিটির আলাদা সেটিংস দিন, এবং মোট দাম একসাথে দেখুন।', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: MessageCircle, title: 'WhatsApp-এ অর্ডার', desc: 'ক্যালকুলেটরে সব সেট করে WhatsApp বা Telegram-এ এক ক্লিকে অর্ডার পাঠান।', color: 'text-teal-600', bg: 'bg-teal-50' },
        { icon: CloudUpload, title: 'ফ্রি PDF টুলস', desc: 'PDF কম্প্রেস, মার্জ, স্প্লিট এবং ব্যাকগ্রাউন্ড ইনভার্ট — সব একখানে, সম্পূর্ণ ফ্রি!', color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: Shield, title: 'নিরাপদ ও গোপনীয়', desc: 'আপনার PDF ফাইল ব্রাউজারেই প্রসেস হয়। আমাদের সার্ভারে কিছু আপলোড হয় না।', color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    const steps = [
        { num: '১', title: 'PDF আপলোড করুন', desc: 'আপনার PDF ফাইলটি ক্যালকুলেটরে আপলোড করুন। পৃষ্ঠা সংখ্যা স্বয়ংক্রিয় গণনা হবে।' },
        { num: '২', title: 'সেটিংস দিন', desc: 'B&W বা কালার, slides per page — আপনার পছন্দ অনুযায়ী সেট করুন।' },
        { num: '৩', title: 'দাম দেখুন', desc: 'তাৎক্ষণিকভাবে মোট দাম দেখে নিন। প্রতিটি PDF-এর আলাদা দামও দেখতে পাবেন।' },
        { num: '৪', title: 'অর্ডার দিন', desc: 'WhatsApp বা Telegram-এ ক্লিক করুন, PDF পাঠান — আমরা প্রিন্ট করে পৌঁছে দেবো!' },
    ];

    return (
        <>
            {/* ===== Hero ===== */}
            <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 pt-[72px] text-white">
                {/* Decorative blurs */}
                <div className="pointer-events-none absolute -right-[20%] -top-[50%] h-[600px] w-[600px] rounded-full bg-teal-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-[30%] -left-[10%] h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-3xl" />

                <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-20">
                    <div className="max-w-[700px]">
                        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/15 px-4 py-2 text-sm text-teal-300">
                            <Sparkles size={16} /> বাংলাদেশের সবচেয়ে সাশ্রয়ী প্রিন্ট সেবা
                        </div>

                        <h1 className="animate-fade-in-up-1 mb-6 text-[clamp(1.9rem,5vw,3rem)] font-extrabold leading-tight tracking-tight">
                            আপনার PDF ফাইল{' '}
                            <span className="bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent">সহজেই প্রিন্ট</span>{' '}
                            করুন
                        </h1>

                        <p className="animate-fade-in-up-2 mb-8 max-w-[550px] text-lg leading-relaxed text-slate-300">
                            PDF আপলোড করুন, স্বয়ংক্রিয়ভাবে পৃষ্ঠা গণনা হবে, তাৎক্ষণিক দাম জানুন — তারপর WhatsApp বা Telegram-এ অর্ডার করুন। কোচিং সেন্টারের স্লাইড থেকে শুরু করে যেকোনো PDF!
                        </p>

                        <div className="animate-fade-in-up-3 flex flex-wrap gap-4">
                            <Link
                                href="/calculator"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-4 text-lg font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition-all hover:from-amber-600 hover:to-amber-500 hover:shadow-xl active:scale-[0.97]"
                            >
                                <Upload size={20} /> এখনই ক্যালকুলেট করুন
                            </Link>
                            <Link
                                href="/order"
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-bold text-white transition-all hover:border-white/60 hover:bg-white/5 active:scale-[0.97]"
                            >
                                কিভাবে অর্ডার করবেন?
                            </Link>
                        </div>

                        <div className="animate-fade-in-up-4 mt-12 flex gap-10 border-t border-white/10 pt-8">
                            <div>
                                <h3 className="text-3xl font-extrabold">৳{bwPrice}</h3>
                                <p className="mt-1 text-sm text-slate-400">প্রতি পাতা (B&W)</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold">৳{colorPrice}</h3>
                                <p className="mt-1 text-sm text-slate-400">প্রতি পাতা (কালার)</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold">১০০০০+</h3>
                                <p className="mt-1 text-sm text-slate-400">সন্তুষ্ট গ্রাহক</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Features ===== */}
            <section className="py-20 bg-slate-950">
                <div className="mx-auto w-full max-w-[1200px] px-6">
                    <div className="mx-auto mb-12 max-w-[600px] text-center">
                        <h2 className="mb-4 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-50">
                            কেন <span className="bg-gradient-to-r from-teal-300 to-teal-400 bg-clip-text text-transparent">CloudPrint</span> বেছে নেবেন?
                        </h2>
                        <p className="text-lg text-slate-400">সবচেয়ে সহজ, দ্রুত এবং সাশ্রয়ী প্রিন্টিং সেবা — আপনার জন্য</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/90 p-8 transition-all hover:-translate-y-1 hover:border-teal-500/60 hover:shadow-xl hover:shadow-teal-900/40">
                                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-lg ${f.bg.replace('50', '900')}`}>
                                        <Icon size={28} className={f.color} />
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-slate-50">{f.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== How It Works ===== */}
            <section className="bg-slate-900 py-20">
                <div className="mx-auto w-full max-w-[1200px] px-6">
                    <div className="mx-auto mb-12 max-w-[600px] text-center">
                        <h2 className="mb-4 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-50">কিভাবে কাজ করে?</h2>
                        <p className="text-lg text-slate-400">মাত্র ৪টি ধাপে আপনার প্রিন্ট অর্ডার সম্পন্ন করুন</p>
                    </div>

                    <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s, i) => (
                            <div key={i} className="relative text-center">
                                <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-xl font-extrabold text-white shadow-lg shadow-teal-600/30" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {s.num}
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-50">{s.title}</h3>
                                <p className="text-sm text-slate-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Pricing Preview ===== */}
            <section className="py-20 bg-slate-950">
                <div className="mx-auto w-full max-w-[1200px] px-6">
                    <div className="mx-auto mb-12 max-w-[600px] text-center">
                        <h2 className="mb-4 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-50">সাশ্রয়ী মূল্য</h2>
                        <p className="text-lg text-slate-400">প্রতি পাতা থেকে শুরু — কোনো লুকানো চার্জ নেই</p>
                    </div>

                    <div className="mx-auto grid max-w-[700px] grid-cols-1 gap-8 sm:grid-cols-2">
                        {/* B&W */}
                        <div className="relative overflow-hidden rounded-2xl border-2 border-teal-500/80 bg-slate-900/80 p-8 text-center shadow-lg shadow-teal-900/40 transition-all hover:-translate-y-1 hover:shadow-xl">
                            <div className="absolute right-[-32px] top-[16px] rotate-45 bg-teal-600 px-10 py-1 text-xs font-semibold text-white">জনপ্রিয়</div>
                            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">সাদা-কালো (B&W)</p>
                            <p className="mb-2 text-4xl font-extrabold text-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                                ৳{bwPrice} <span className="text-lg font-normal text-slate-400">/ পাতা</span>
                            </p>
                            <p className="mb-6 text-sm text-slate-500">১ পাতা = ২ পৃষ্ঠা (সামনে + পেছনে)</p>
                            <Link href="/calculator" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3 font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-600">
                                <Calculator size={18} /> ক্যালকুলেট করুন
                            </Link>
                        </div>

                        {/* Color */}
                        <div className="rounded-2xl border-2 border-slate-700 bg-slate-900/80 p-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/40">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">কালার প্রিন্ট</p>
                            <p className="mb-2 text-4xl font-extrabold text-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                                ৳{colorPrice} <span className="text-lg font-normal text-slate-400">/ পাতা</span>
                            </p>
                            <p className="mb-6 text-sm text-slate-500">১ পাতা = ২ পৃষ্ঠা (সামনে + পেছনে)</p>
                            <Link href="/calculator" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-500 py-3 font-bold text-teal-300 transition-all hover:bg-teal-600 hover:text-white">
                                <Calculator size={18} /> ক্যালকুলেট করুন
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="bg-slate-900 py-20">
                <div className="mx-auto w-full max-w-[1200px] px-6 text-center">
                    <div className="mx-auto mb-12 max-w-[600px]">
                        <h2 className="mb-4 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-50">এখনই শুরু করুন!</h2>
                        <p className="text-lg text-slate-400">আপনার PDF আপলোড করুন এবং তাৎক্ষণিক দাম জানুন</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/calculator" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-4 text-lg font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition-all hover:from-amber-600 hover:to-amber-500 active:scale-[0.97]">
                            <Calculator size={20} /> প্রাইস ক্যালকুলেটর
                        </Link>
                        <a
                            href={`https://wa.me/${contacts.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:from-green-600 hover:to-green-700 active:scale-[0.97]"
                        >
                            <MessageCircle size={20} /> WhatsApp-এ যোগাযোগ
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
