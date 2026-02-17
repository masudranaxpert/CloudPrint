'use client';
import { useState, useEffect } from 'react';
import { PlayCircle, Video } from 'lucide-react';

function extractVideoId(url) {
    if (!url) return null;
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

export default function TutorialsPage() {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tutorials').then((r) => r.json()).then((d) => { setTutorials(d.tutorials || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[1200px] px-6 py-12">
                <div className="mb-8">
                    <h1 className="flex items-center gap-3 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-900">
                        <Video size={28} className="text-teal-600" /> ভিডিও টিউটোরিয়াল
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">CloudPrint ব্যবহার করা শিখুন — ভিডিওতে দেখুন, সহজেই বুঝুন</p>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-[200px] rounded-xl" />)}
                    </div>
                ) : tutorials.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tutorials.map((tutorial) => {
                            const videoId = extractVideoId(tutorial.videoUrl);
                            return (
                                <div key={tutorial._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl">
                                    <div className="relative aspect-video w-full">
                                        {videoId ? (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={tutorial.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute inset-0 h-full w-full"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                                <PlayCircle size={48} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h4 className="mb-1 font-semibold text-slate-900">{tutorial.title}</h4>
                                        {tutorial.description && <p className="text-sm text-slate-500">{tutorial.description}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 text-center text-slate-400">
                        <Video size={48} strokeWidth={1} className="mx-auto mb-4 opacity-30" />
                        <p className="text-xl">শীঘ্রই টিউটোরিয়াল আসছে!</p>
                        <p className="mt-2 text-sm">আমরা দ্রুত টিউটোরিয়াল যোগ করছি</p>
                    </div>
                )}
            </div>
        </div>
    );
}
