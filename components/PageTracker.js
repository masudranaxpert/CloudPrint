'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/track';

export default function PageTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Don't track admin pages
        if (!pathname.startsWith('/admin') && !pathname.startsWith('/admin')) {
            trackPageView();
        }
    }, [pathname]);

    return null;
}
