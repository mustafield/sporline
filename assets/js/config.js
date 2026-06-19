const API_BASE = window.__SPORLINE_API__ || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin
);

window.SporlineConfig = {
    API_BASE,
    API: {
        content: `${API_BASE}/api/content`,
        contacts: `${API_BASE}/api/contacts`,
        auth: `${API_BASE}/api/auth`,
        blog: `${API_BASE}/api/blog`,
        upload: `${API_BASE}/api/upload`,
        health: `${API_BASE}/api/health`,
        schema: `${API_BASE}/api/schema`,
        contentStream: `${API_BASE}/api/content/stream`
    },
    // Fallback WhatsApp number (uluslararası format, başında 0 veya + olmadan)
    fallbackWhatsApp: '905538103320',
    SITE_URL: 'https://www.sporlinefitness.com.tr'
};
