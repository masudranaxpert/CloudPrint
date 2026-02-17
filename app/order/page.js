'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Calculator, Upload, Settings, Eye, ShoppingCart, FileText } from 'lucide-react';

const orderSteps = [
    { num: '১', icon: Calculator, title: 'প্রাইস ক্যালকুলেটরে যান', desc: <>প্রথমে আমাদের <Link href="/calculator" className="font-semibold text-teal-600 hover:underline">প্রাইস ক্যালকুলেটর</Link> পেজে যান। এখানে আপনি আপনার PDF ফাইল আপলোড করতে পারবেন এবং তাৎক্ষণিক দাম জানতে পারবেন।</> },
    { num: '২', icon: Upload, title: 'PDF আপলোড করুন', desc: 'আপনার PDF ফাইলটি ক্যালকুলেটরে ড্র্যাগ করুন বা ক্লিক করে সিলেক্ট করুন। পৃষ্ঠা সংখ্যা স্বয়ংক্রিয়ভাবে গণনা হবে। একসাথে ১০-২০টি PDF অ্যাড করতে পারবেন!' },
    { num: '৩', icon: Settings, title: 'সেটিংস ঠিক করুন', desc: null, list: ['প্রিন্ট টাইপ: সাদা-কালো (৳১.৩/পাতা) অথবা কালার (৳২.৬/পাতা)', 'Slides per page: ১, ২, ৪, ৮, বা ১৬টি স্লাইড একটি পৃষ্ঠায়', 'কপি: কতগুলো কপি চান'] },
    { num: '৪', icon: Eye, title: 'দাম দেখুন', desc: 'ডান পাশের সারসংক্ষেপে প্রতিটি PDF-এর আলাদা দাম এবং সর্বমোট দাম দেখতে পাবেন। কোনো লুকানো চার্জ নেই!' },
    { num: '৫', icon: MessageCircle, title: 'WhatsApp বা Telegram-এ অর্ডার দিন', desc: 'সব ঠিক থাকলে "WhatsApp-এ অর্ডার করুন" বাটনে ক্লিক করুন। স্বয়ংক্রিয়ভাবে আপনার অর্ডারের সম্পূর্ণ বিবরণ সহ WhatsApp মেসেজ তৈরি হবে।' },
    { num: '৬', icon: FileText, title: 'PDF ফাইল পাঠান', desc: 'WhatsApp/Telegram-এ অর্ডার মেসেজ পাঠানোর পর, আপনার PDF ফাইলগুলোও চ্যাটে পাঠিয়ে দিন। ব্যাস, আমরা প্রিন্ট করে পৌঁছে দেবো! 🎉' },
];

export default function OrderPage() {
    const [contacts, setContacts] = useState({ whatsappNumber: '8801XXXXXXXXX', telegramUsername: 'cloudprint_bd' });

    useEffect(() => {
        fetch('/api/settings').then((r) => r.json()).then((d) => setContacts(d)).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 pt-[72px]">
            <div className="mx-auto max-w-[900px] px-6 py-12">
                <div className="mb-10">
                    <h1 className="flex items-center gap-3 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-50">
                        <ShoppingCart size={32} className="text-teal-400" /> কিভাবে অর্ডার করবেন?
                    </h1>
                    <p className="mt-2 text-lg text-slate-400">খুব সহজ! নিচের ধাপগুলো অনুসরণ করুন</p>
                </div>

                <div className="flex flex-col gap-6">
                    {orderSteps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="flex gap-6 rounded-xl border border-slate-800 bg-slate-900/90 p-6 transition-all hover:border-teal-500/70 hover:shadow-lg hover:shadow-slate-900/60">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-lg font-extrabold text-white shadow-lg shadow-teal-900/40" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {s.num}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-50">
                                        <Icon size={20} className="text-teal-400" /> {s.title}
                                    </h3>
                                    {s.desc && <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>}
                                    {s.list && (
                                        <>
                                            <p className="mb-2 text-sm text-slate-400">প্রতিটি PDF-এর জন্য নিচের সেটিংস দিন:</p>
                                            <ul className="flex flex-col gap-2 pl-5 text-sm text-slate-400">
                                                {s.list.map((item, j) => <li key={j} className="list-disc">{item}</li>)}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact CTA */}
                <div className="mx-auto mt-12 max-w-[600px] rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-lg shadow-slate-900/60">
                    <h3 className="mb-2 text-xl font-bold text-slate-50">এখনই অর্ডার করুন!</h3>
                    <p className="mb-6 text-slate-400">কোনো সমস্যা হলে সরাসরি আমাদের সাথে যোগাযোগ করুন</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href={`https://wa.me/${contacts.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-bold text-white transition-all hover:from-green-600 hover:to-green-700">
                            <MessageCircle size={20} /> WhatsApp
                        </a>
                        <a href={`https://t.me/${contacts.telegramUsername}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-3 font-bold text-white transition-all hover:from-blue-500 hover:to-blue-600">
                            <Send size={20} /> Telegram
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
