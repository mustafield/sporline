/**
 * Sporline CMS - Dynamic content loader
 * Admin panelinden (MongoDB) gelen içeriği canlı sitedeki gerçek elementlere işler.
 */
(function () {
    const config = window.SportlineConfig || {};
    const API_BASE = config.API_BASE || 'https://sporline.onrender.com';
    const API = config.API || {
        content: `${API_BASE}/api/content`,
        contentStream: `${API_BASE}/api/content/stream`,
        contacts: `${API_BASE}/api/contacts`
    };

    let contentData = null;

    // ---------- Yardımcı Set Fonksiyonları ----------
    const byId = (id) => document.getElementById(id);

    const setTextById = (id, value) => {
        if (value === undefined || value === null || value === '') return;
        const el = byId(id);
        if (el) el.textContent = value;
    };

    const setTextByKey = (key, value) => {
        if (value === undefined || value === null || value === '') return;
        document.querySelectorAll(`[data-cms-key="${key}"]`).forEach((el) => {
            if (el.tagName === 'IMG') el.setAttribute('src', value);
            else el.textContent = value;
        });
    };

    const setImgById = (id, value) => {
        if (!value) return;
        const el = byId(id);
        if (el) el.setAttribute('src', value);
    };

    const setImgByKey = (key, value) => {
        if (!value) return;
        document.querySelectorAll(`[data-cms-key="${key}"]`).forEach((el) => el.setAttribute('src', value));
    };

    const setAttrById = (id, attr, value) => {
        if (!value) return;
        const el = byId(id);
        if (el) el.setAttribute(attr, value);
    };

    const onlyDigits = (s) => String(s || '').replace(/[^\d]/g, '');

    // ---------- SEO ----------
    const updateSEO = (seo) => {
        if (!seo) return;
        if (seo.title) document.title = seo.title;
        setTextByKey('site_title', seo.title);
        const desc = document.querySelector('meta[name="description"]');
        if (desc && seo.description) desc.setAttribute('content', seo.description);
        const kw = document.querySelector('meta[name="keywords"]');
        if (kw && seo.keywords) kw.setAttribute('content', seo.keywords);
    };

    // ---------- Hero ----------
    const updateHero = (hero) => {
        if (!hero) return;
        setTextById('hero-tag', hero.tagline);
        setTextByKey('hero_tag', hero.tagline);
        setTextById('hero-title-1', hero.titleLine1);
        setTextById('hero-title-2', hero.titleLine2);
        setTextById('hero-desc', hero.description);
        setTextByKey('hero_desc', hero.description);
        setTextById('hero-cta-primary', hero.ctaPrimary);
        setTextById('hero-cta-secondary', hero.ctaSecondary);
    };

    // ---------- Hakkımızda ----------
    const updateAbout = (about) => {
        if (!about) return;
        setTextById('hakkimizda-label', about.sectionLabel);
        setTextById('hakkimizda-title', about.title);
        setTextById('hakkimizda-subtitle', about.subtitle);
        setTextById('hakkimizda-text1', about.text1);
        setTextById('hakkimizda-text2', about.text2);
        setImgById('hakkimizda-img', about.imageUrl);
    };

    // ---------- Haberler ----------
    const renderFacts = (id, facts) => {
        const el = byId(id);
        if (!el || !Array.isArray(facts) || !facts.length) return;
        el.innerHTML = facts.map((f) =>
            `<li class="flex gap-2"><span class="text-brandGold">•</span><span>${f}</span></li>`
        ).join('');
    };

    const renderNewsGrid = (id, items) => {
        const el = byId(id);
        if (!el || !Array.isArray(items) || !items.length) return;
        el.innerHTML = items.map((item) => `
            <div class="p-6 rounded-2xl bg-brandDark border border-neutral-900 hover:border-brandGold/30 transition duration-300">
                <h3 class="text-base font-bold font-heading text-white mb-2">${item.title || ''}</h3>
                <p class="text-xs text-neutral-400 font-light leading-relaxed">${item.description || ''}</p>
            </div>`).join('');
    };

    const updateNews = (news) => {
        if (!news) return;
        setTextById('haberler-label', news.sectionLabel);
        setTextById('haberler-title', news.title);
        setTextById('haberler-intro', news.intro);
        renderFacts('haberler-facts', news.randomFacts);
        renderNewsGrid('haberler-grid', news.items);

        setTextById('sidebar-news-label', news.sectionLabel);
        setTextById('sidebar-news-title', news.title);
        setTextById('sidebar-news-intro', news.intro);
        renderFacts('sidebar-news-facts', news.randomFacts);
    };

    // ---------- Milli Sporcular ----------
    const updateAthletes = (section) => {
        if (!section || !Array.isArray(section.items)) return;
        section.items.forEach((a, i) => {
            const n = i + 1;
            setTextByKey(`athlete_${n}_name`, a.name);
            setTextByKey(`athlete_${n}_branch`, a.branch);
            setTextByKey(`athlete_${n}_detail`, a.detail);
            setTextByKey(`athlete_${n}_badge`, a.badge);
            setImgByKey(`athlete_${n}_image`, a.image);
        });
    };

    // ---------- Programlar (Branşlar) ----------
    const updatePrograms = (section) => {
        if (!section || !Array.isArray(section.items)) return;
        section.items.forEach((p, i) => {
            const n = i + 1;
            setTextByKey(`branch_${n}_title`, p.title);
            setTextByKey(`branch_${n}_desc`, p.description);
        });
    };

    // ---------- Ürünler ----------
    const updateProducts = (section) => {
        if (!section || !Array.isArray(section.items)) return;
        section.items.forEach((p, i) => {
            const n = i + 1;
            setTextByKey(`product_${n}_title`, p.title);
            setImgByKey(`product_${n}_image`, p.image);
        });
    };

    // ---------- İletişim ----------
    const updateContactInfo = (contact) => {
        if (!contact) return;
        setTextById('iletisim-label', contact.sectionLabel);
        setTextById('iletisim-title', contact.title);
        setTextById('iletisim-phone', contact.telefon);
        const tel = contact.telefonRaw || onlyDigits(contact.telefon);
        if (tel) setAttrById('iletisim-phone-link', 'href', `tel:+${tel}`);
        setTextById('iletisim-hours', contact.saatler);
        setAttrById('contact-map', 'src', contact.mapEmbedUrl);

        // Footer iletişim satırları
        setTextById('footer-phone', contact.telefon);
        setTextById('footer-address', contact.adres);

        // VIP form branş seçenekleri
        const branchSelect = byId('form-branch');
        if (branchSelect && Array.isArray(contact.formBranches) && contact.formBranches.length) {
            branchSelect.innerHTML = contact.formBranches.map((b) => `<option>${b}</option>`).join('');
        }
    };

    // ---------- Footer ----------
    const updateFooter = (footer) => {
        if (!footer) return;
        setTextById('footer-tagline', footer.tagline);
        setTextByKey('footer_text', footer.tagline);
        setTextById('footer-copyright', footer.copyright);
        if (footer.poweredBy) {
            const powered = byId('footer-powered');
            const span = powered && powered.querySelector('span');
            if (span) span.textContent = footer.poweredBy;
        }
    };

    // ---------- Sosyal Medya ----------
    const socialIcon = (platform) => {
        const icons = {
            instagram: '<path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>',
            whatsapp: '<path d="M187.58,144.84l-24-12a8,8,0,0,0-8,1l-11.1,9.25a112.51,112.51,0,0,1-40.47-40.47l9.25-11.1a8,8,0,0,0-10-4.32l-24,9.6A8,8,0,0,0,64,72.4c0,61.53,50.07,111.6,111.6,111.6a8,8,0,0,0,7.16-4l9.6-24A8,8,0,0,0,187.58,144.84ZM128,24A104,104,0,0,0,36.8,178.07L25.33,212.48a16,16,0,0,0,20.19,20.19l34.41-11.47A104,104,0,1,0,128,24Z"></path>',
            facebook: '<path d="M128,24A104,104,0,1,0,140,231.25V152h-24a8,8,0,0,1,0-16h24V112a36,36,0,0,1,36-36h16a8,8,0,0,1,0,16H176a20,20,0,0,0-20,20v24h28a8,8,0,0,1,0,16H156v79.25A104,104,0,0,0,128,24Z"></path>',
            youtube: '<path d="M164.44,121.34l-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V111l25.58,17ZM234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,39.88,131,40,128,40s-57.56-.12-91.84,13.12a24,24,0,0,0-14.49,16.4C19.08,79.5,16,97.74,16,128s3.08,48.5,5.67,58.48a24,24,0,0,0,14.49,16.4C70.44,216.12,125,216,128,216s57.56.12,91.84-13.12a24,24,0,0,0,14.49-16.4C236.92,176.5,240,158.26,240,128S236.92,79.5,234.33,69.52Z"></path>'
        };
        return icons[platform] || icons.instagram;
    };

    const updateSocial = (socials) => {
        if (!Array.isArray(socials) || !socials.length) return;
        const container = byId('footer-social');
        if (container) {
            container.innerHTML = socials
                .filter((s) => s && s.url && s.isActive !== false)
                .map((s) => `
                <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-900 hover:border-brandGold/40 rounded-xl py-2.5 text-neutral-400 hover:text-brandGold transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">${socialIcon(s.platform)}</svg>
                    <span class="text-[10px] font-bold uppercase tracking-widest">${s.platform || ''}</span>
                </a>`).join('');
        }
        const wa = socials.find((s) => s.platform === 'whatsapp');
        if (wa && wa.url) setAttrById('sponsor-whatsapp-btn', 'href', wa.url);
    };

    const applyAllContent = (data) => {
        if (!data) return;
        updateSEO(data.seo);
        updateHero(data.hero);
        updateAbout(data.hakkimizda);
        updateNews(data.haberler);
        updatePrograms(data.programlar);
        updateAthletes(data.milliSporcular);
        updateProducts(data.urunler);
        updateContactInfo(data.iletisim);
        updateFooter(data.footer);
        updateSocial(data.sosyalMedya);
    };

    const fetchLiveContent = async () => {
        try {
            const res = await fetch(`${API.content}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
            const result = await res.json();
            if (result.success && result.data) {
                contentData = result.data;
                applyAllContent(contentData);
            }
        } catch (err) {
            console.error('Sporline CMS Canlı İçerik Çekme Hatası:', err);
        }
    };

    const listenLiveStreamUpdates = () => {
        if (!window.EventSource || !API.contentStream) return;
        const source = new EventSource(API.contentStream);
        source.addEventListener('contentUpdated', (e) => {
            try {
                contentData = JSON.parse(e.data);
                console.log('⚡ [Sporline Canlı CMS] İçerik anlık olarak güncellendi.');
                applyAllContent(contentData);
            } catch (err) {
                console.error('SSE Akış Ayrıştırma Hatası:', err);
            }
        });
        source.onerror = () => {
            source.close();
            setTimeout(listenLiveStreamUpdates, 5000);
        };
    };

    // ---------- VIP / İletişim Formu ----------
    const initContactForm = () => {
        const form = byId('vip-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn ? btn.textContent : '';
            if (btn) { btn.disabled = true; btn.textContent = 'GÖNDERİLİYOR...'; }

            const payload = {
                adSoyad: byId('form-name')?.value || '',
                telefon: byId('form-phone')?.value || '',
                brans: byId('form-branch')?.value || '',
                mesaj: byId('form-message')?.value || ''
            };

            try {
                const res = await fetch(API.contacts, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showToast('Talebiniz başarıyla salonumuza ulaştı! En kısa sürede dönüş yapılacaktır.');
                    form.reset();
                } else {
                    showToast(data.message || 'Bir hata oluştu.', 'error');
                }
            } catch (err) {
                showToast('Sunucu bağlantı hatası. Lütfen tekrar deneyin.', 'error');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = originalText; }
            }
        });
    };

    const showToast = (message, type = 'success') => {
        let toast = byId('sporline-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sporline-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = `fixed bottom-24 right-6 z-[1000] px-6 py-4 rounded-xl text-sm font-medium shadow-2xl transition-all duration-500 ${
            type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'
        }`;
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
        }, 4000);
    };

    document.addEventListener('DOMContentLoaded', () => {
        fetchLiveContent();
        listenLiveStreamUpdates();
        initContactForm();
    });
})();
