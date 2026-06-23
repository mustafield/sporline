/**
 * Sporline CMS - Dynamic content loader
 */
(function () {
    const config = window.SportlineConfig || {};
    const API_BASE = config.API_BASE || 'https://sporline.onrender.com';
    const API = config.API || {
        content: `${API_BASE}/api/content`,
        contentStream: `${API_BASE}/api/content/stream`,
        schema: `${API_BASE}/schema`,
        contacts: `${API_BASE}/api/contacts`
    };

    let contentData = null;

    const setText = (selector, value) => {
        const el = document.querySelector(selector);
        if (el && value) el.textContent = value;
    };

    const setHTML = (selector, value) => {
        const el = document.querySelector(selector);
        if (el && value) el.innerHTML = value;
    };

    const setAttr = (selector, attr, value) => {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute(attr, value);
    };

    const formatPrice = (n) => '₺' + Number(n).toLocaleString('tr-TR');

    const updateSEO = (seo) => {
        if (!seo) return;
        document.title = seo.title || document.title;
        setAttr('meta[name="description"]', 'content', seo.description);
        setAttr('meta[name="keywords"]', 'content', seo.keywords);
        setAttr('meta[name="robots"]', 'content', seo.robots);
        setAttr('link[rel="canonical"]', 'href', seo.canonical);
        setAttr('meta[property="og:title"]', 'content', seo.title);
        setAttr('meta[property="og:description"]', 'content', seo.description);
        setAttr('meta[property="og:image"]', 'content', seo.ogImage);
        setAttr('meta[property="og:url"]', 'content', seo.canonical);
        setAttr('meta[name="twitter:title"]', 'content', seo.title);
        setAttr('meta[name="twitter:description"]', 'content', seo.description);
        setAttr('meta[name="twitter:image"]', 'content', seo.ogImage);

        const schemaEl = document.getElementById('schema-json');
        if (schemaEl && API.schema) {
            fetch(API.schema).then(r => r.json()).then(res => {
                if (res.success) schemaEl.textContent = JSON.stringify(res.data);
            }).catch(() => {});
        }
    };

    const renderFeatures = (items) => {
        const container = document.getElementById('features-grid');
        if (!container || !items?.length) return;
        container.innerHTML = items.map((item, i) => `
            <article class="bg-brandCard dark:bg-brandCard light:bg-brandLightCard p-6 rounded-2xl border border-neutral-900 dark:border-neutral-900 light:border-brandLightBorder animated-card reveal-up" data-reveal>
                <div class="text-brandGold font-heading text-2xl font-black mb-2">${String(i + 1).padStart(2, '0')}</div>
                <h3 class="text-base font-bold font-heading uppercase text-white dark:text-white light:text-brandDark mb-1">${item.title}</h3>
                <p class="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 font-light">${item.description}</p>
            </article>
        `).join('');
    };

    const renderPrograms = (data) => {
        const container = document.getElementById('programs-grid');
        if (!container || !data) return;
        setText('#programlar-label', data.sectionLabel);
        setText('#programlar-title', data.title);
        if (!data.items?.length) return;
        container.innerHTML = data.items.map(item => `
            <article class="p-8 rounded-2xl bg-brandDark border border-neutral-900 hover:border-brandGold/30 transition duration-300 gsap-reveal">
                <h3 class="text-lg font-bold font-heading text-white mb-2">${item.title || ''}</h3>
                <p class="text-xs text-neutral-400 font-light leading-relaxed">${item.description || ''}</p>
            </article>
        `).join('');
    };

    const renderPaketler = (data) => {
        const container = document.getElementById('paketler-grid');
        if (!container || !data) return;
        setText('#paketler-label', data.sectionLabel);
        setText('#paketler-title', data.title);
        if (!data.items?.length) return;
        container.innerHTML = data.items.map((item, i) => `
            <article class="package-card p-6 rounded-2xl bg-brandCard border border-neutral-900 hover:border-brandGold/30 transition duration-300 gsap-reveal flex flex-col">
                ${item.badge ? `<span class="text-[10px] font-bold uppercase tracking-wider text-brandGold mb-2">${item.badge}</span>` : ''}
                <h3 class="text-base font-bold font-heading text-white uppercase mb-2">${item.isim || ''}</h3>
                <p id="index-p${i + 1}" class="text-2xl font-black text-brandGold mb-4">${formatPrice(item.fiyat || 0)}</p>
                <ul class="space-y-2 text-xs text-neutral-400 flex-1">${(item.features || []).map((f) => `<li>• ${f}</li>`).join('')}</ul>
                <a href="#" class="package-whatsapp-btn mt-4 inline-flex items-center justify-center w-full py-3 rounded-xl bg-brandGold text-brandDark text-xs font-bold uppercase tracking-widest hover:bg-white transition">Paket Talebi</a>
            </article>
        `).join('');
    };

    const renderAthletes = (data) => {
        const container = document.getElementById('athletes-grid');
        if (!container || !data) return;
        setText('#milli-sporcular-label', data.sectionLabel);
        setText('#milli-sporcular-title', data.title);
        if (!data.items?.length) return;
        container.innerHTML = data.items.map((item) => `
            <article class="group relative rounded-2xl overflow-hidden border border-neutral-900 bg-brandCard/50 transition-all duration-500 hover:border-brandGold/40 gsap-reveal">
                <div class="h-[400px] overflow-hidden relative">
                    <div class="absolute inset-0 bg-gradient-to-t from-brandDark via-brandDark/20 to-transparent z-10"></div>
                    <img src="${item.image || ''}" alt="${item.name || 'Milli Sporcu'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0">
                    ${item.badge ? `<span class="absolute top-4 right-4 z-20 bg-brandGold text-brandDark font-mono font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">${item.badge}</span>` : ''}
                </div>
                <div class="p-6 relative z-20 -mt-10 bg-brandCard border-t border-neutral-900 rounded-b-2xl">
                    <h3 class="text-lg font-bold font-heading text-white group-hover:text-brandGold transition">${item.name || ''}</h3>
                    <p class="text-xs text-neutral-400 font-medium tracking-wide mb-2">${item.branch || ''}</p>
                    <p class="text-xs text-neutral-500 font-light leading-relaxed">${item.detail || ''}</p>
                </div>
            </article>
        `).join('');
    };

    const renderProducts = (data) => {
        const container = document.getElementById('products-grid');
        if (!container || !data) return;
        setText('#urunler-label', data.sectionLabel);
        setText('#urunler-title', data.title);
        if (!data.items?.length) return;
        container.innerHTML = data.items.map((item) => `
            <article class="bg-brandCard border border-neutral-900 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-brandGold/5 gsap-reveal package-card">
                ${item.badge ? `<div class="absolute top-4 left-4 bg-neutral-900 border border-neutral-800 text-[9px] font-mono tracking-widest text-brandGold px-3 py-1 rounded-full uppercase">${item.badge}</div>` : ''}
                <div class="h-56 w-full flex items-center justify-center my-4 transition-transform duration-500 group-hover:scale-105">
                    <img src="${item.image || ''}" alt="${item.title || 'Ürün'}" class="h-full object-cover rounded-xl">
                </div>
                <div class="space-y-3">
                    <h3 class="text-base font-bold font-heading text-white">${item.title || ''}</h3>
                    <div class="flex justify-between items-center pt-2 border-t border-neutral-900">
                        <span class="text-xs font-mono text-neutral-500 uppercase tracking-wider">${item.subtitle || ''}</span>
                        <span class="text-xs font-bold text-brandGold bg-brandGold/10 border border-brandGold/20 px-3 py-1 rounded-lg">${item.status || ''}</span>
                    </div>
                    <a href="#iletisim" class="package-whatsapp-btn inline-flex items-center justify-center w-full bg-brandGold text-brandDark py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition duration-300">Paket Talebi</a>
                </div>
            </article>
        `).join('');
    };

    const renderSponsors = (data) => {
        if (!data) return;
        setText('#sponsorlar-label', data.sectionLabel);
        setText('#sponsorlar-title', data.title);
        setText('#sponsorlar-cta-title', data.ctaTitle);
        setText('#sponsorlar-cta-text', data.ctaText);
        const container = document.getElementById('sponsors-marquee');
        if (!container || !data.items?.length) return;
        const sorted = [...data.items].sort((a, b) => (a.order || 0) - (b.order || 0));
        const names = sorted.map((item) => `
            <span class="text-lg font-black font-heading text-neutral-700 tracking-widest uppercase hover:text-brandGold transition px-4">${item.name || ''}</span>
        `).join('');
        container.innerHTML = names + names;
    };

    const renderNews = (data) => {
        const container = document.getElementById('haberler-grid');
        const factList = document.getElementById('haberler-facts');
        const sidebarFactList = document.getElementById('sidebar-news-facts');
        if (!container || !data) return;
        setText('#haberler-label', data.sectionLabel);
        setText('#haberler-title', data.title);
        setText('#haberler-intro', data.intro);
        setText('#sidebar-news-label', data.sectionLabel);
        setText('#sidebar-news-title', data.title);
        setText('#sidebar-news-intro', data.intro);
        const factItems = (data.randomFacts || []).map(fact => `
                <li class="text-[11px] text-neutral-400 leading-relaxed">${fact}</li>
            `).join('');
        if (factList) factList.innerHTML = factItems;
        if (sidebarFactList) sidebarFactList.innerHTML = factItems;
        
        if (!data.items?.length) {
            container.innerHTML = '<p class="text-xs text-neutral-500">Henüz haber eklenmedi.</p>';
            return;
        }
        container.innerHTML = data.items.map(item => `
            <article class="bg-brandCard p-4 rounded-2xl border border-neutral-900 space-y-2">
                <h4 class="text-sm font-bold uppercase text-white">${item.title}</h4>
                <p class="text-[11px] text-neutral-400 leading-relaxed">${item.description}</p>
            </article>
        `).join('');
    };

    const renderFooterLinks = (links, containerId) => {
        const container = document.getElementById(containerId);
        if (!container || !links?.length) return;
        container.innerHTML = links.sort((a, b) => a.order - b.order).map(link => `
            <li><a href="${link.href}" class="footer-link nav-btn hover:text-brandGold transition duration-300">${link.label}</a></li>
        `).join('');
    };

    const renderSocial = (items) => {
        const container = document.getElementById('footer-social');
        if (!container || !items?.length) return;

        const icons = {
            instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" class="z-10 transition-transform duration-500 social-icon"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg>`,
            whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" class="z-10 social-icon"><path d="M187.58,144.84l-24-12a8,8,0,0,0-8,1l-11.1,9.25a112.51,112.51,0,0,1-40.47-40.47l9.25-11.1a8,8,0,0,0-10-4.32l-24,9.6A8,8,0,0,0,64,72.4c0,61.53,50.07,111.6,111.6,111.6a8,8,0,0,0,7.16-4l9.6-24A8,8,0,0,0,187.58,144.84Z"></path></svg>`,
            facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" class="z-10 social-icon"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path></svg>`,
            youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" class="z-10 social-icon"><path d="M164.44,121.34l-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V110.95L145.53,128Zm114-81.53v79.06a32,32,0,0,1-32,32H54a32,32,0,0,1-32-32V63.52a32,32,0,0,1,32-32h148a32,32,0,0,1,32,32Z"></path></svg>`
        };

        container.innerHTML = items.filter(s => s.isActive).map(s => `
            <a href="${s.url}" target="_blank" rel="noopener noreferrer"
               class="social-btn instagram-glow-btn w-12 h-12 rounded-xl bg-brandCard dark:bg-brandCard light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-brandLightBorder flex items-center justify-center text-white dark:text-white light:text-brandDark relative overflow-hidden transition-all duration-300 shadow-lg"
               aria-label="${s.platform} sayfamız">
                ${icons[s.platform] || icons.instagram}
                <div class="glow-layer absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-tr from-brandGold via-ironRed to-ironRedGlow"></div>
            </a>
        `).join('');
    };

    const applyContent = (data) => {
        if (!data) return;

        const { hero, hakkimizda, programlar, paketler, iletisim, footer, seo, siteSettings } = data;

        if (hero) {
            setText('#hero-tag', hero.tagline);
            setText('#hero-title-1', hero.titleLine1);
            setText('#hero-title-2', hero.titleLine2);
            setText('#hero-desc', hero.description);
            setText('#hero-cta-primary', hero.ctaPrimary);
            setText('#hero-cta-secondary', hero.ctaSecondary);
            const video = document.getElementById('hero-video');
            if (video && hero.videoUrl) {
                const sources = video.querySelectorAll('source');
                if (sources[0]) sources[0].src = hero.videoUrl;
                if (sources[1] && hero.videoWebm) sources[1].src = hero.videoWebm;
                video.load();
            }
        }

        if (data.ozellikler) renderFeatures(data.ozellikler);

        if (hakkimizda) {
            setText('#hakkimizda-label', hakkimizda.sectionLabel);
            setText('#hakkimizda-title', hakkimizda.title);
            setText('#hakkimizda-subtitle', hakkimizda.subtitle);
            setText('#hakkimizda-text1', hakkimizda.text1);
            setText('#hakkimizda-text2', hakkimizda.text2);
            const img = document.getElementById('hakkimizda-img');
            if (img) {
                if (hakkimizda.imageUrl) img.src = hakkimizda.imageUrl;
                if (hakkimizda.imageAlt) img.alt = hakkimizda.imageAlt;
            }
        }

        if (data.haberler) renderNews(data.haberler);
        if (data.milliSporcular) renderAthletes(data.milliSporcular);
        if (programlar) renderPrograms(programlar);
        if (paketler) renderPaketler(paketler);
        if (data.urunler) renderProducts(data.urunler);
        if (data.sponsorlar) renderSponsors(data.sponsorlar);

        if (iletisim) {
            setText('#iletisim-label', iletisim.sectionLabel);
            setText('#iletisim-title', iletisim.title);
            setText('#iletisim-phone', iletisim.telefon);
            setText('#iletisim-hours', iletisim.saatler);
            setText('#footer-phone', iletisim.telefon);
            setText('#footer-address', iletisim.adres);
            const phoneLink = document.getElementById('iletisim-phone-link');
            if (phoneLink) {
                if (iletisim.whatsapp) {
                    const defaultText = 'Merhaba Sporline Fitness, web sitenizdeki form aracılığıyla size ulaşıyorum.';
                    const template = iletisim.whatsappMessageTemplate || defaultText;
                    const whatsappText = template
                        .replace('{name}', '')
                        .replace('{phone}', '')
                        .replace('{branch}', '')
                        .replace('{message}', '');
                    phoneLink.href = `https://wa.me/${iletisim.whatsapp}?text=${encodeURIComponent(whatsappText.trim())}`;
                    phoneLink.setAttribute('aria-label', 'WhatsApp ile iletişim');
                } else {
                    phoneLink.href = `tel:${iletisim.telefonRaw || iletisim.telefon}`;
                }
            }
            const map = document.getElementById('contact-map');
            if (map && iletisim.mapEmbedUrl) map.src = iletisim.mapEmbedUrl;
            const wa = document.getElementById('whatsapp-widget');
            if (wa && iletisim.whatsapp) {
                const defaultText = 'Merhaba Sporline Fitness, web sitenizdeki form aracılığıyla size ulaşıyorum.';
                const template = iletisim.whatsappMessageTemplate || defaultText;
                wa.href = `https://wa.me/${iletisim.whatsapp}?text=${encodeURIComponent(template)}`;
            }
            document.querySelectorAll('.package-whatsapp-btn').forEach((btn, idx) => {
                if (!iletisim.whatsapp) return;
                const packageTitle = btn.closest('.package-card')?.querySelector('h3')?.textContent?.trim() || `Paket ${idx + 1}`;
                const packageText = `Merhaba Sporline Fitness, ${packageTitle} için bilgi almak istiyorum. Lütfen paket detaylarını paylaşır mısınız?`;
                btn.href = `https://wa.me/${iletisim.whatsapp}?text=${encodeURIComponent(packageText)}`;
                btn.setAttribute('target', '_blank');
                btn.setAttribute('rel', 'noopener noreferrer');
            });
            
            const sponsorBtn = document.getElementById('sponsor-whatsapp-btn');
            if (sponsorBtn) {
                if (iletisim.whatsapp) {
                    const sponsorText = 'Merhaba Sporline Fitness, sponsorluk başvurusu yapmak istiyorum. Lütfen bilgi paylaşır mısınız?';
                    sponsorBtn.href = `https://wa.me/${iletisim.whatsapp}?text=${encodeURIComponent(sponsorText)}`;
                    sponsorBtn.setAttribute('target', '_blank');
                    sponsorBtn.setAttribute('rel', 'noopener noreferrer');
                } else if (iletisim.email) {
                    sponsorBtn.href = `mailto:${iletisim.email}?subject=Sponsorluk%20Başvurusu`;
                }
            }
            const branchSelect = document.getElementById('form-branch');
            if (branchSelect && iletisim.formBranches?.length) {
                branchSelect.innerHTML = iletisim.formBranches.map(b => `<option>${b}</option>`).join('');
            }
        }

        if (footer) {
            setText('#footer-tagline', footer.tagline);
            setText('#footer-copyright', footer.copyright);
            setText('#footer-powered', footer.poweredBy);
            setText('#footer-phone', footer.phone);
            setText('#footer-address', footer.address);
            renderFooterLinks(footer.quickLinks, 'footer-quick-links');
            renderFooterLinks(footer.legalLinks, 'footer-legal-links');
        }

        if (data.sosyalMedya) renderSocial(data.sosyalMedya);

        if (siteSettings) {
            setText('.logo-text', siteSettings.logoText);
            setText('.logo-accent', siteSettings.logoAccent);
        }

        updateSEO(seo);
    };

    const fetchContent = async () => {
        const url = `${API.content}?t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (!result.success) throw new Error('API success false döndü.');
        return result.data;
    };

    const loadContent = async () => {
        try {
            try {
                contentData = await fetchContent();
            } catch (firstErr) {
                console.warn('CMS ilk istek başarısız, tekrar deneniyor...', firstErr);
                await new Promise((r) => setTimeout(r, 1500));
                contentData = await fetchContent();
            }
            applyContent(contentData);
        } catch (err) {
            console.error('CMS içerik sunucudan yüklenemedi:', err);
            const fallback = config.fallbackWhatsApp || '';
            contentData = {
                iletisim: {
                    whatsapp: fallback,
                    isWhatsAppForm: true,
                    whatsappMessageTemplate: "Merhaba Sporline Fitness, web sitenizdeki form aracılığıyla size ulaşıyorum.%0A%0A*İsim:* {name}%0A*Telefon:* {phone}%0A*Branş:* {branch}%0A*Mesaj:* {message}",
                    telefon: '',
                    telefonRaw: ''
                }
            };
            applyContent(contentData);
        }
    };

    const setupLiveUpdates = () => {
        if (!window.EventSource || !API.contentStream) return;

        try {
            const source = new EventSource(API.contentStream);
            source.addEventListener('contentUpdated', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data) {
                        contentData = data;
                        applyContent(contentData);
                        showToast('Sitede yeni güncelleme var. İçerik yenilendi.', 'success');
                    }
                } catch (err) {
                    console.warn('Canlı içerik güncellemesi işlenemedi.', err);
                }
            });

            source.addEventListener('error', () => {
                if (source.readyState === EventSource.CLOSED) {
                    console.warn('Canlı güncelleme bağlantısı kapatıldı.');
                }
            });
        } catch (e) {
            console.warn("EventSource başlatılamadı:", e);
        }
    };

    const setupVIPForm = () => {
        const form = document.getElementById('vip-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Gönderiliyor...';

            const name = document.getElementById('form-name').value;
            const phone = document.getElementById('form-phone').value;
            const branch = document.getElementById('form-branch').value;
            const message = document.getElementById('form-message') ? document.getElementById('form-message').value : '';

            if (contentData?.iletisim?.whatsapp && contentData.iletisim.isWhatsAppForm) {
                let whatsappMessage = contentData.iletisim.whatsappMessageTemplate || "Merhaba Sporline Fitness, web sitenizdeki form aracılığıyla size ulaşıyorum.%0A%0A*İsim:* {name}%0A*Telefon:* {phone}%0A*Branş:* {branch}%0A*Mesaj:* {message}";
                whatsappMessage = whatsappMessage
                    .replace('{name}', name)
                    .replace('{phone}', phone)
                    .replace('{branch}', branch)
                    .replace('{message}', message);

                window.open(`https://wa.me/${contentData.iletisim.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                form.reset();
                showToast('Mesajınız WhatsApp üzerinden iletilmek üzere hazırlandı!', 'success');
                btn.disabled = false;
                btn.textContent = originalText;
            } else {
                try {
                    const res = await fetch(API.contacts, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adSoyad: name, telefon: phone, brans: branch, mesaj: message })
                    });
                    const result = await res.json();
                    if (result.success) {
                        form.reset();
                        showToast('VIP Başvurunuz başarıyla iletildi! En kısa sürede dönüş yapacağız.', 'success');
                    } else {
                        showToast(result.message || 'Bir hata oluştu.', 'error');
                    }
                } catch {
                    showToast('Sunucu bağlantı hatası. Lütfen tekrar deneyin.', 'error');
                }
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    };

    const showToast = (message, type = 'success') => {
        let toast = document.getElementById('sporline-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sporline-toast';
            toast.className = 'fixed bottom-24 right-6 z-[1000] px-6 py-4 rounded-xl text-sm font-medium shadow-2xl transition-all duration-500 translate-y-20 opacity-0';
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

    window.SporlineCMS = { loadContent, applyContent, showToast };

    document.addEventListener('DOMContentLoaded', () => {
        loadContent();
        setupVIPForm();
        setupLiveUpdates();
    });
})();
