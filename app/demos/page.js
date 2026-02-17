export const metadata = {
    title: 'ডেমো গ্যালারি — CloudPrint',
    description: 'আমাদের প্রিন্ট কোয়ালিটি দেখুন। বিভিন্ন ধরনের প্রিন্ট — B&W, কালার, বিভিন্ন slides per page।',
};

const demos = [
    { id: 1, title: '১ Slide/Page — সাদা-কালো', description: 'স্ট্যান্ডার্ড প্রিন্ট, ১ স্লাইড প্রতি পৃষ্ঠায়', type: 'B&W', slides: 1 },
    { id: 2, title: '২ Slides/Page — সাদা-কালো', description: '২টি স্লাইড একটি পৃষ্ঠায়, সাশ্রয়ী', type: 'B&W', slides: 2 },
    { id: 3, title: '৪ Slides/Page — সাদা-কালো', description: '৪টি স্লাইড একটি পৃষ্ঠায়, সবচেয়ে সাশ্রয়ী', type: 'B&W', slides: 4 },
    { id: 4, title: '১ Slide/Page — কালার', description: 'ফুল কালার প্রিন্ট, উজ্জ্বল ও স্পষ্ট', type: 'Color', slides: 1 },
    { id: 5, title: '২ Slides/Page — কালার', description: 'কালার প্রিন্ট, ২ স্লাইড per page', type: 'Color', slides: 2 },
    { id: 6, title: '৪ Slides/Page — কালার', description: 'কালার প্রিন্ট, ৪ স্লাইড per page', type: 'Color', slides: 4 },
    { id: 7, title: 'ফিজিক্স নোট — B&W', description: 'HSC ফিজিক্স হ্যান্ডনোট, পরিষ্কার টেক্সট', type: 'B&W', slides: 1 },
    { id: 8, title: 'কেমিস্ট্রি স্লাইড — কালার', description: 'Udvash কেমিস্ট্রি স্লাইড, ফুল কালার', type: 'Color', slides: 2 },
    { id: 9, title: 'ম্যাথ শীট — B&W', description: 'ম্যাথ প্র্যাক্টিস শীট, ক্লিয়ার প্রিন্ট', type: 'B&W', slides: 1 },
    { id: 10, title: 'বায়োলজি ডায়াগ্রাম — কালার', description: 'বায়োলজি রঙিন ডায়াগ্রাম, হাই কোয়ালিটি', type: 'Color', slides: 1 },
    { id: 11, title: 'ICT নোট — B&W', description: 'ICT চ্যাপ্টার নোট, কমপ্যাক্ট ফরম্যাট', type: 'B&W', slides: 4 },
    { id: 12, title: 'ইংলিশ গ্রামার — B&W', description: 'ইংরেজি গ্রামার রুলস, টেবিল ফরম্যাট', type: 'B&W', slides: 2 },
];

export default function DemosPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[1200px] px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-900">ডেমো গ্যালারি</h1>
                    <p className="mt-2 text-lg text-slate-500">বিভিন্ন ধরনের প্রিন্ট কেমন দেখায় — নিচের উদাহরণগুলো দেখুন</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {demos.map((demo) => (
                        <div key={demo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl">
                            {/* Preview area */}
                            <div className={`flex h-[200px] flex-col items-center justify-center gap-2 ${demo.type === 'Color' ? 'bg-gradient-to-br from-teal-50 to-amber-50' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                                <div
                                    className="gap-1"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${demo.slides <= 2 ? demo.slides : 2}, 1fr)`,
                                        gridTemplateRows: `repeat(${demo.slides <= 2 ? 1 : 2}, 1fr)`,
                                        width: demo.slides === 1 ? '60px' : '100px',
                                        height: demo.slides === 1 ? '80px' : '100px',
                                    }}
                                >
                                    {Array.from({ length: demo.slides }).map((_, i) => (
                                        <div key={i} className={`rounded ${demo.type === 'Color' ? 'border border-teal-300 bg-teal-200' : 'border border-slate-400 bg-slate-300'}`} />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400">{demo.slides} slide/page • {demo.type}</span>
                            </div>

                            {/* Card info */}
                            <div className="p-5">
                                <h4 className="mb-1 font-bold text-slate-900">{demo.title}</h4>
                                <p className="mb-3 text-sm text-slate-500">{demo.description}</p>
                                <div className="flex gap-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${demo.type === 'Color' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                        {demo.type}
                                    </span>
                                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                                        {demo.slides} slide/page
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
