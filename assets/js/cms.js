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

    // --- STRATEJİK JORDA AUDIO PLAYLIST MOTORU ---
    let playlist = [];
    let currentTrackIndex = 0;
    let audioPlayer = new Audio();

    const setupAudioPlaylist = (musics) => {
        if (!musics || !Array.isArray(musics) || !musics.length) return;
        
        playlist = musics;
        currentTrackIndex = 0;
        
        audioPlayer.src = playlist[currentTrackIndex];
        audioPlayer.volume = 0.35; // Salon ambiyansı için ideal ses seviyesi
        
        // Şarkı bittiğinde tetiklenecek sihirli döngü olay dinleyicisi
        audioPlayer.onended = () => {
            currentTrackIndex++;
            if (currentTrackIndex >= playlist.length) {
                currentTrackIndex = 0; // Şarkılar bitince en başa sar
            }
            console.log(`[Sporline] Sıradaki fon müziğine geçiliyor index: ${currentTrackIndex}`);
            audioPlayer.src = playlist[currentTrackIndex];
            audioPlayer.play().catch(e => console.log("Otomatik oynatma engeli."));
        };

        // Kullanıcı tarayıcı kısıtlamasını aşsın diye ilk tıklamada müziği tetikle
        document.body.addEventListener('click', () => {
            if (audioPlayer.paused && currentTrackIndex === 0) {
                audioPlayer.play().catch(err => console.log("Müzik çalma başlatılamadı."));
            }
        }, { once: true });
    };

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
    };

    const updateHero = (hero) => {
        if (!hero) return;
        setText('.hero-tagline', hero.tagline);
        setText('.hero-title-1', hero.title1);
        setText('.hero-title-2', hero.title2);
        setText('.hero-description', hero.description);
        setText('.hero-cta-1', hero.cta1);
        setText('.hero-cta-2', hero.cta2);
        
        const videoEl = document.querySelector('.hero-video-src');
        if (videoEl && hero.videoUrl && videoEl.getAttribute('src') !== hero.videoUrl) {
            videoEl.setAttribute('src', hero.videoUrl);
            const parentVideo = videoEl.parentElement;
            if (parentVideo && typeof parentVideo.load === 'function') {
                parentVideo.load();
                parentVideo.play().catch(() => {});
            }
        }
    };

    const updateAbout = (about) => {
        if (!about) return;
        setText('.about-label', about.label);
        setText('.about-title', about.title);
        setText('.about-subtitle', about.subtitle);
        setText('.about-p1', about.paragraph1);
        setText('.about-p2', about.paragraph2);
        if (about.imageUrl) setAttr('.about-image', 'src', about.imageUrl);
    };

    const updateMarquee = (news) => {
        if (!news || !Array.isArray(news.items)) return;
        const container = document.querySelector('.marquee-container');
        if (!container) return;
        container.innerHTML = news.items.map(item => `<span class="mx-4 font-medium text-xs tracking-wider uppercase">${item}</span>`).join('<span class="text-brandGold">•</span>');
    };

    const updatePrograms = (prog) => {
        if (!prog || !Array.isArray(prog.items)) return;
        prog.items.forEach((item, index) => {
            setText(`.prog-title-${index}`, item.title);
            setText(`.prog-desc-${index}`, item.description);
            if (item.imageUrl) setAttr(`.prog-img-${index}`, 'src', item.imageUrl);
        });
    };

    const updatePrices = (pricing) => {
        if (!pricing || !Array.isArray(pricing.items)) return;
        pricing.items.forEach((item, index) => {
            setText(`.price-title-${index}`, item.title);
            setText(`.price-amt-${index}`, formatPrice(item.price));
            setText(`.price-period-${index}`, item.period);
            
            const listEl = document.querySelector(`.price-features-${index}`);
            if (listEl && Array.isArray(item.features)) {
                listEl.innerHTML = item.features.map(f => `
                    <li class="flex items-center gap-3 text-neutral-400 text-xs">
                        <svg class="w-3.5 h-3.5 text-brandGold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                        <span>${f}</span>
                    </li>`).join('');
            }
        });
    };

    const updateAthletes = (athletes) => {
        if (!athletes || !Array.isArray(athletes.items)) return;
        athletes.items.forEach((item, index) => {
            setText(`.ath-name-${index}`, item.name);
            setText(`.ath-title-${index}`, item.title);
            if (item.imageUrl) setAttr(`.ath-img-${index}`, 'src', item.imageUrl);
        });
    };

    const updateProducts = (shop) => {
        if (!shop || !Array.isArray(shop.items)) return;
        shop.items.forEach((item, index) => {
            setText(`.prod-title-${index}`, item.title);
            setText(`.prod-price-${index}`, formatPrice(item.price));
            if (item.imageUrl) setAttr(`.prod-img-${index}`, 'src', item.imageUrl);
        });
    };

    const updateSponsors = (spons) => {
        if (!spons || !Array.isArray(spons.items)) return;
        spons.items.forEach((item, index) => {
            if (item.imageUrl) setAttr(`.spon-img-${index}`, 'src', item.imageUrl);
        });
    };

    const updateContactInfo = (contact) => {
        if (!contact) return;
        setText('.info-phone', contact.phone);
        setText('.info-email', contact.email);
        setText('.info-address', contact.address);
        setText('.info-hours', contact.hours);
        if (contact.mapSrc) setAttr('.info-map', 'src', contact.mapSrc);
    };

    const updateSocialMedia = (social) => {
        if (!social) return;
        if (social.instagram) setAttr('.link-instagram', 'href', social.instagram);
        if (social.whatsapp) setAttr('.link-whatsapp', 'href', social.whatsapp);
        if (social.facebook) setAttr('.link-facebook', 'href', social.facebook);
        if (social.youtube) setAttr('.link-youtube', 'href', social.youtube);
    };

    const updateFooterInfo = (footer) => {
        if (!footer) return;
        setText('.footer-copyright', footer.copyright);
        setText('.footer-about', footer.aboutText);
    };

    const applyAllContent = (data) => {
        updateSEO(data.seo);
        updateHero(data.hero);
        updateAbout(data.hakkimizda);
        updateMarquee(data.haberler);
        updatePrograms(data.programlar);
        updatePrices(data.paketler);
        updateAthletes(data.milliSporcular);
        updateProducts(data.urunler);
        updateSponsors(data.sponsorlar);
        updateContactInfo(data.iletisim);
        updateSocialMedia(data.sosyalMedya);
        updateFooterInfo(data.footer);
        
        // Müzikleri Listeye Bağla (YENİ)
        setupAudioPlaylist(data.musics);
    };

    const fetchLiveContent = async () => {
        try {
            const res = await fetch(API.content, { headers: { 'Cache-Control': 'no-cache' } });
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
        if (!window.EventSource) return;
        const source = new EventSource(API.contentStream);
        
        source.addEventListener('contentUpdated', (e) => {
            try {
                const updatedData = JSON.parse(e.data);
                console.log('⚡ [Sporline Canlı CMS] İçerik anlık olarak güncellendi.');
                contentData = updatedData;
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

    const initContactForm = () => {
        const form = document.getElementById('sporline-contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'GÖNDERİLİYOR...';

            const payload = {
                name: document.getElementById('form-name')?.value,
                email: document.getElementById('form-email')?.value,
                phone: document.getElementById('form-phone')?.value,
                subject: document.getElementById('form-program')?.value,
                message: document.getElementById('form-message')?.value
            };

            try {
                const res = await fetch(API.contacts, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Talebiniz başarıyla salonumuza ulaştı! En kısa sürede dönüş yapılacaktır.');
                    form.reset();
                } else {
                    showToast(data.message || 'Bir hata oluştu.', 'error');
                }
            } catch (err) {
                showToast('Sunucu bağlantı hatası. Lütfen tekrar deneyin.', 'error');
            } finally {
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

    // --- BAŞLATICI ---
    document.addEventListener('DOMContentLoaded', () => {
        fetchLiveContent();
        listenLiveStreamUpdates();
        initContactForm();
    });
})();