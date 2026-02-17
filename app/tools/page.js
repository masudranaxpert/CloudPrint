import Link from 'next/link';
import { FileArchive, Layers, Scissors, SunMoon } from 'lucide-react';

export const metadata = {
    title: 'ফ্রি PDF টুলস — CloudPrint',
    description: 'PDF কম্প্রেস, মার্জ, স্প্লিট এবং ব্যাকগ্রাউন্ড ইনভার্ট — সব ফ্রি PDF টুল এক জায়গায়।',
};

const tools = [
    { href: '/tools/compress', title: 'PDF কম্প্রেস', description: 'PDF ফাইলের সাইজ কমান। কোয়ালিটি বজায় রেখে ছোট করুন।', icon: FileArchive, color: 'text-teal-600', bg: 'bg-teal-50' },
    { href: '/tools/merge', title: 'PDF মার্জ', description: 'একাধিক PDF ফাইলকে একটি ফাইলে যুক্ত করুন।', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
    { href: '/tools/split', title: 'PDF স্প্লিট', description: 'একটি PDF ফাইলকে একাধিক ভাগে ভাগ করুন।', icon: Scissors, color: 'text-blue-600', bg: 'bg-blue-50' },
    { href: '/tools/invert', title: 'ব্যাকগ্রাউন্ড ইনভার্ট', description: 'কালো ব্যাকগ্রাউন্ড সাদা করুন — ডার্ক স্লাইড লাইট করুন।', icon: SunMoon, color: 'text-slate-700', bg: 'bg-slate-100' },
];

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[1200px] px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-900">ফ্রি PDF টুলস</h1>
                    <p className="mt-2 text-lg text-slate-500">আপনার PDF ফাইলগুলো সহজেই এডিট করুন — সব ব্রাউজারেই চলবে, কোনো সফটওয়্যার লাগবে না!</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <Link key={tool.href} href={tool.href} className="group rounded-xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
                                <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-xl ${tool.bg}`}>
                                    <Icon size={32} className={tool.color} />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-teal-700">{tool.title}</h3>
                                <p className="text-sm text-slate-500">{tool.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
