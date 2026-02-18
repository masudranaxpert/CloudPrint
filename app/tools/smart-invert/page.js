'use client';
import { useState } from 'react';
import { smartInvertPdfBackground, downloadBlob } from '@/lib/pdf-utils';
import { trackToolUsage } from '@/lib/track';
import { Upload, Download, RotateCw, MoonStar } from 'lucide-react';

export default function SmartInvertPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleInvert = async () => {
        if (!file) return;
        const MAX_SIZE_BYTES = 70 * 1024 * 1024; // 70MB
        if (file.size > MAX_SIZE_BYTES) {
            alert('File is larger than 70MB. Please select a smaller PDF.');
            return;
        }
        setLoading(true);
        setProgress({ current: 0, total: 0 });
        trackToolUsage('smart-invert');
        try {
            const blob = await smartInvertPdfBackground(file, (current, total) => setProgress({ current, total }));
            setResultBlob(blob);
            setDone(true);
        } catch (err) {
            console.error('Smart invert error:', err);
            alert('বিশেষ ইনভার্ট করতে সমস্যা হয়েছে।');
        }
        setLoading(false);
    };

    const handleReset = () => {
        setFile(null);
        setDone(false);
        setResultBlob(null);
        setProgress({ current: 0, total: 0 });
    };

    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[640px] px-6 py-12">
                <h1 className="mb-2 flex items-center gap-3 text-[clamp(1.5rem,4vw,2rem)] font-bold text-slate-900">
                    <MoonStar size={28} className="text-teal-600" /> কালো PDF থেকে সাদা PDF (স্পেশাল)
                </h1>
                <p className="mb-8 text-slate-500">
                    ডার্ক স্লাইড/কালো চারপাশকে হালকা/সাদা ব্যাকগ্রাউন্ডে রূপান্তর করুন, আর ভেতরের সাদা/উজ্জ্বল অংশগুলো যতটা সম্ভব আগের মতো রাখুন।
                </p>

                <div
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-all hover:border-teal-500 hover:bg-teal-50/50"
                    onClick={() => document.getElementById('smart-invert-input').click()}
                >
                    <Upload size={36} className="text-slate-400" strokeWidth={1.5} />
                    <p className="font-semibold text-slate-700">{file ? file.name : 'ডার্ক স্লাইড/কালো চারপাশের PDF সিলেক্ট করুন'}</p>
                    <p className="text-sm text-slate-400">ক্লিক করুন বা ড্র্যাগ করুন</p>
                    <input
                        id="smart-invert-input"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                            setFile(e.target.files[0]);
                            setDone(false);
                            setResultBlob(null);
                        }}
                    />
                </div>

                {file && !done && (
                    <div className="mt-4">
                        <button
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-600 disabled:opacity-60"
                            onClick={handleInvert}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> বিশেষ ইনভার্ট হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <MoonStar size={20} /> বিশেষ ইনভার্ট করুন
                                </>
                            )}
                        </button>
                        {loading && progress.total > 0 && (
                            <div className="mt-4">
                                <div className="mb-2 flex justify-between text-sm text-slate-500">
                                    <span>পৃষ্ঠা {progress.current}/{progress.total} প্রসেস হচ্ছে...</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{pct}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                    <div className="h-full rounded-full bg-teal-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {done && resultBlob && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                        <div className="mb-4 text-5xl">✅</div>
                        <h3 className="text-xl font-bold text-slate-900">স্পেশাল ইনভার্ট সফল!</h3>
                        <p className="mt-2 text-sm text-slate-500">{progress.total} পৃষ্ঠা প্রসেস করা হয়েছে</p>
                        <div className="mt-4 flex flex-col gap-3">
                            <button
                                onClick={() => downloadBlob(resultBlob, `smart_inverted_${file.name}`)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white transition-all hover:from-teal-700 hover:to-teal-600"
                            >
                                <Download size={20} /> ডাউনলোড করুন
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50"
                            >
                                <RotateCw size={18} /> আরেকটি ফাইল ইনভার্ট করুন
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

