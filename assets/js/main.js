/**
 * Sporline Main - Theme, Music & Core UI
 */

const themeSwitch = document.getElementById('theme-switch');
const htmlEl = document.documentElement;
const themeOverlay = document.getElementById('theme-overlay');

// Tema yönetimi
if (localStorage.getItem('theme') === 'light') {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
} else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
}

if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
        const rect = themeSwitch.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        themeOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        setTimeout(() => {
            themeOverlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;
        }, 10);

        setTimeout(() => {
            if (htmlEl.classList.contains('dark')) {
                htmlEl.classList.remove('dark');
                htmlEl.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                htmlEl.classList.remove('light');
                htmlEl.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
            setTimeout(() => {
                themeOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
            }, 50);
        }, 400);
    });
}

const menuToggle = document.getElementById('menu-toggle');
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle) menuToggle.checked = false;
});

// ─── MONGOODB'DEN CANLI VERİLERİ ÇEKİP SİTEYE BASAN SCRIPT ───
document.addEventListener('DOMContentLoaded', async () => {
    const { API } = window.SportlineConfig || {};
    if (!API || !API.content) {
        console.error("CMS Hatası: API bağlantı ayarları yüklenemedi.");
        return;
    }

    try {
        const res = await fetch(`${API.content}?t=${Date.now()}`);
        const result = await res.json();

        if (result && result.success) {
            const content = result.data;
            
            // Görsel/Video yollarını düzenleyen yardımcı fonksiyon
            const getValidUrl = (url) => {
                if (!url) return '';
                // URL zaten tam linkse (http ile başlıyorsa) dokunma, değilse /uploads/ altına ekle
                return url.startsWith('http') ? url : `https://sporline.onrender.com/uploads/${url}`;
            };

            const updateCmsElement = (key, value) => {
                if (value === undefined || value === null) return;
                const elements = document.querySelectorAll(`[data-cms-key="${key}"]`);
                
                elements.forEach(el => {
                    if (el.tagName === 'IMG') {
                        el.src = getValidUrl(value);
                    } else if (el.tagName === 'VIDEO') {
                        el.src = getValidUrl(value);
                        el.load();
                        el.play().catch(e => console.log("Video oynatma hatası:", e));
                    } else if (el.tagName === 'SOURCE') {
                        el.src = getValidUrl(value);
                        const videoParent = el.closest('video');
                        if (videoParent) {
                            videoParent.load();
                        }
                    } else {
                        el.innerHTML = value; 
                    }
                });
            };

            // İçerik Güncellemeleri
            if (content.hero) {
                updateCmsElement('hero_tagline', content.hero.tagline);
                updateCmsElement('hero_title1', content.hero.titleLine1);
                updateCmsElement('hero_title2', content.hero.titleLine2);
                updateCmsElement('hero_desc', content.hero.description);
                updateCmsElement('hero_video', content.hero.videoUrl);
            }

            if (content.hakkimizda) {
                updateCmsElement('about_label', content.hakkimizda.sectionLabel);
                updateCmsElement('about_title', content.hakkimizda.title);
                updateCmsElement('about_text1', content.hakkimizda.text1);
                updateCmsElement('about_image', content.hakkimizda.imageUrl);
            }

            // Diğer alanlar...
            console.log("Sporline CMS: Canlı veriler başarıyla yüklendi.");
        }
    } catch (err) {
        console.error("Canlı veri çekilirken hata oluştu:", err);
    }
});