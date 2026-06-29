/**
 * Sporline Main - Theme, Music & Core UI
 */

const themeSwitch = document.getElementById('theme-switch');
const htmlEl = document.documentElement;
const themeOverlay = document.getElementById('theme-overlay');

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
            
            // Medya öğelerini de destekleyen güncellenmiş fonksiyon
            const updateCmsElement = (key, value) => {
                if (value === undefined || value === null) return;
                const elements = document.querySelectorAll(`[data-cms-key="${key}"]`);
                
                elements.forEach(el => {
                    if (el.tagName === 'IMG') {
                        el.src = value; 
                    } else if (el.tagName === 'VIDEO') {
                        el.src = value;
                        el.load();
                        el.play().catch(e => console.log("Video oynatma hatası:", e));
                    } else if (el.tagName === 'SOURCE') {
                        el.src = value;
                        const videoParent = el.closest('video');
                        if (videoParent) {
                            videoParent.load();
                        }
                    } else {
                        el.innerHTML = value; 
                    }
                });
            };

            // 1. HERO BÖLÜMÜ GÜNCELLEMELERİ
            if (content.hero) {
                updateCmsElement('hero_tagline', content.hero.tagline);
                updateCmsElement('hero_title1', content.hero.titleLine1);
                updateCmsElement('hero_title2', content.hero.titleLine2);
                updateCmsElement('hero_desc', content.hero.description);
                updateCmsElement('hero_video', content.hero.videoUrl);
                updateCmsElement('hero_cta1', content.hero.ctaPrimary);
                updateCmsElement('hero_cta2', content.hero.ctaSecondary);
            }

            // 2. HAKKIMIZDA BÖLÜMÜ GÜNCELLEMELERİ
            if (content.hakkimizda) {
                updateCmsElement('about_label', content.hakkimizda.sectionLabel);
                updateCmsElement('about_title', content.hakkimizda.title);
                updateCmsElement('about_subtitle', content.hakkimizda.subtitle);
                updateCmsElement('about_text1', content.hakkimizda.text1);
                updateCmsElement('about_text2', content.hakkimizda.text2);
                updateCmsElement('about_image', content.hakkimizda.imageUrl);
            }

            // 3. İLETİŞİM BÖLÜMÜ GÜNCELLEMELERİ
            if (content.iletisim) {
                updateCmsElement('contact_phone', content.iletisim.telefon);
                updateCmsElement('contact_email', content.iletisim.email);
                updateCmsElement('contact_address', content.iletisim.adres);
                updateCmsElement('contact_hours', content.iletisim.saatler);
            }

            // 4. FOOTER BÖLÜMÜ GÜNCELLEMELERİ
            if (content.footer) {
                updateCmsElement('footer_tagline', content.footer.tagline);
                updateCmsElement('footer_copyright', content.footer.copyright);
            }

            console.log("Sporline CMS: Canlı veriler başarıyla yüklendi.");
        }
    } catch (err) {
        console.error("Canlı veri çekilirken hata oluştu:", err);
    }
});