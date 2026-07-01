// Tarayıcıda hostname kontrolü yaparak dinamik API URL'si belirleme
const isAdminPage = /admin\.html$/i.test(window.location.pathname);
const localApiBase = 'http://localhost:5000';
const productionApiBase = 'https://sporline.onrender.com';

const API_BASE = window.__SPORLINE_API__ || (
        isAdminPage
            ? productionApiBase
            : (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
                    ? productionApiBase
                    : localApiBase)
);

window.SportlineConfig = {
    API_BASE,
    API: {
        content: `${API_BASE}/api/content`,
        contacts: `${API_BASE}/api/contacts`,
        auth: `${API_BASE}/api/auth`,
        blog: `${API_BASE}/api/blog`,
        upload: `${API_BASE}/api/upload`,
        health: `${API_BASE}/api/health`,
        schema: `${API_BASE}/schema`,
        contentStream: `${API_BASE}/api/content/stream`
    },
    // Fallback WhatsApp number (uluslararası format, başında 0 veya + olmadan)
    fallbackWhatsApp: '905538103320',
    SITE_URL: 'https://www.sporlinefitness.com.tr'
};