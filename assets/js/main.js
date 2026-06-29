/**
 * Sporline Main - Güncellenmiş CMS Entegrasyonu
 */
document.addEventListener('DOMContentLoaded', async () => {
    const { API } = window.SportlineConfig || {};
    if (!API || !API.content) return;

    try {
        const res = await fetch(`${API.content}?t=${Date.now()}`);
        const result = await res.json();

        if (result && result.success) {
            const content = result.data;
            
            // Görsel/Video yollarını düzeltici fonksiyon
            const getValidUrl = (url) => {
                if (!url) return '';
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
                    } else if (el.tagName === 'SOURCE') {
                        el.src = getValidUrl(value);
                        const videoParent = el.closest('video');
                        if (videoParent) videoParent.load();
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
                updateCmsElement('about_image', content.hakkimizda.imageUrl);
            }
            // ... (diğer bölümler aynı şekilde)
            console.log("CMS: Veriler başarıyla yüklendi.");
        }
    } catch (err) {
        console.error("Veri çekme hatası:", err);
    }
});