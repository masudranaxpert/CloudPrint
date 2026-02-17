/**
 * Analytics tracker - sends events to /api/analytics
 * Used across the site to track page views, tool usage, and order clicks
 */

export function trackEvent(event, extra = {}) {
    // Fire and forget - don't block the UI
    fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, ...extra }),
    }).catch(() => { });
}

export function trackPageView() {
    trackEvent('pageView');
}

export function trackCalculatorUsage() {
    trackEvent('calculator');
}

export function trackOrderClick() {
    trackEvent('orderClick');
}

export function trackToolUsage(tool) {
    trackEvent('tool', { tool });
}
