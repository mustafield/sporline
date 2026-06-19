/**
 * Sporline CMS - Dynamic content loader
 */
(function () {
    const { API } = window.SporlineConfig || {};
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
        if (schemaEl) {
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
        if (!container) return;
        setText('#programlar-label', data.sectionLabel);
        setText('#programlar-title', data.title);
        if (!data.items?.length) return;
        container.innerHTML = data.items.map(item => `
            <article class="bg-brandCard dark:bg-brandCard light:bg-brandLightCard p-6 rounded-2xl border border-neutral-900 dark:border-neutral-900 light:border-brandLightBorder animated-card reveal-up" data-reveal>
                <h3 class="text-lg font-bold font-heading text-white dark:text-white light:text-brandDark uppercase mb-2">${item.title}</h3>
                <p class="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 font-light leading-relaxed">${item.description}</p>
            </article>
        `).join('');
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
        if (factList) {
            factList.innerHTML = factItems;
        }
        if (sidebarFactList) {
            sidebarFactList.innerHTML = factItems;
        }
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
        if (programlar) renderPrograms(programlar);

        if (paketler) {
            setText('#paketler-label', paketler.sectionLabel);
            setText('#paketler-title', paketler.title);
            ['paket1', 'paket2', 'paket3', 'paket4', 'paket5'].forEach((key, i) => {
                const p = paketler[key];
                if (!p) return;
                const priceEl = document.getElementById(`index-p${i + 1}`);
                if (priceEl) priceEl.textContent = formatPrice(p.fiyat);
            });
        }

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
                const packageTitle = btn.closest('.package-card')?.querySelector('h3[data-cms-key$="_title"]')?.textContent || `Paket ${idx + 1}`;
                const packageText = `Merhaba Sporline Fitness, ${packageTitle} için bilgi almak istiyorum. Lütfen paket detaylarını paylaşır mısınız?`;
                btn.href = `https://wa.me/${iletisim.whatsapp}?text=${encodeURIComponent(packageText)}`;
                btn.setAttribute('target', '_blank');
                btn.setAttribute('rel', 'noopener noreferrer');
            });
            // Sponsorluk başvurusu butonunu WhatsApp'a bağla
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

    const loadContent = async () => {
        try {
            const res = await fetch(API.content);
            const result = await res.json();
            if (result.success) {
                contentData = result.data;
                applyContent(contentData);
            }
        } catch (err) {
            console.warn('CMS içerik yüklenemedi, varsayılan içerik kullanılıyor. Fallback WhatsApp uygulanıyor.');
            // Eğer sunucuya ulaşılamazsa kullanıcı tarafından belirtilen fallback numarayı kullan
            const fallback = window.SporlineConfig && window.SporlineConfig.fallbackWhatsApp ? window.SporlineConfig.fallbackWhatsApp : '';
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

        source.addEventListener('error', (event) => {
            if (source.readyState === EventSource.CLOSED) {
                console.warn('Canlı güncelleme bağlantısı kapatıldı.');
            }
        });
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
            const message = document.getElementById('form-message') ? document.getElementById('form-message').value : ''; // Eğer mesaj alanı varsa al

            if (contentData?.iletisim?.whatsapp) {
                // WhatsApp'a yönlendir
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
                // Mevcut API çağrısını sürdür
                try {
                    const res = await fetch(API.contacts, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adSoyad: name, telefon: phone, brans: branch, mesaj: message }) // Mesajı da ekledik
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
