/**
 * Sporline Admin Panel v2.0
 */
(function () {
    const { API } = window.SporlineConfig || {};
    let token = localStorage.getItem('sporline_token');
    let currentUser = null;
    let contentData = {};

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const api = async (url, options = {}) => {
        const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
        const data = await res.json();
        if (res.status === 401) { logout(); throw new Error('Oturum süresi doldu'); }
        return data;
    };

    const toast = (msg, type = 'success') => {
        const el = $('#admin-toast');
        el.textContent = msg;
        el.className = `fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`;
        el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; }, 3500);
    };

    const logout = () => {
        token = null;
        localStorage.removeItem('sporline_token');
        $('#login-screen').classList.remove('hidden');
        $('#admin-app').classList.add('hidden');
    };

    const showApp = () => {
        $('#login-screen').classList.add('hidden');
        $('#admin-app').classList.remove('hidden');
    };

    // ─── AUTH ───
    const login = async (e) => {
        e.preventDefault();
        const email = $('#login-email').value;
        const password = $('#login-password').value;
        try {
            const res = await fetch(`${API.auth}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                token = data.data.token;
                currentUser = data.data.user;
                localStorage.setItem('sporline_token', token);
                $('#user-name').textContent = currentUser.name;
                showApp();
                await initDashboard();
                toast('Giriş başarılı!');
            } else {
                toast(data.message, 'error');
            }
        } catch {
            toast('Sunucuya bağlanılamadı', 'error');
        }
    };

    const checkAuth = async () => {
        if (!token) return;
        try {
            const res = await api(`${API.auth}/me`);
            if (res.success) {
                currentUser = res.data;
                $('#user-name').textContent = currentUser.name;
                showApp();
                await initDashboard();
            }
        } catch { logout(); }
    };

    // ─── NAVIGATION ───
    const switchPanel = (panelId) => {
        $$('.admin-panel').forEach(p => p.classList.add('hidden'));
        $(`#panel-${panelId}`)?.classList.remove('hidden');
        $$('.sidebar-link').forEach(l => l.classList.remove('active'));
        $(`.sidebar-link[data-panel="${panelId}"]`)?.classList.add('active');
        $('#panel-title').textContent = $(`.sidebar-link[data-panel="${panelId}"]`)?.textContent?.trim() || '';
    };

    // ─── CONTENT ───
    const loadContent = async () => {
        const res = await api(API.content);
        if (res.success) {
            contentData = res.data;
            populateAllForms();
        }
    };

    const populateAllForms = () => {
        const c = contentData;
        if (!c) return;

        const setVal = (id, val) => { const el = $(`#${id}`); if (el && val !== undefined) el.value = val; };

        if (c.hero) {
            setVal('hero-tagline', c.hero.tagline);
            setVal('hero-title1', c.hero.titleLine1);
            setVal('hero-title2', c.hero.titleLine2);
            setVal('hero-desc', c.hero.description);
            setVal('hero-video', c.hero.videoUrl);
            setVal('hero-cta1', c.hero.ctaPrimary);
            setVal('hero-cta2', c.hero.ctaSecondary);
        }
        if (c.hakkimizda) {
            setVal('about-label', c.hakkimizda.sectionLabel);
            setVal('about-title', c.hakkimizda.title);
            setVal('about-subtitle', c.hakkimizda.subtitle);
            setVal('about-text1', c.hakkimizda.text1);
            setVal('about-text2', c.hakkimizda.text2);
            setVal('about-image', c.hakkimizda.imageUrl);
        }
        if (c.haberler) {
            setVal('news-label', c.haberler.sectionLabel);
            setVal('news-title', c.haberler.title);
            setVal('news-intro', c.haberler.intro);
            setVal('news-facts', (c.haberler.randomFacts || []).join('\n'));
            renderCardEditor('news-editor', c.haberler.items || [], 'haberler');
        }
        if (c.paketler && c.paketler.items) {
            c.paketler.items.forEach((item, i) => {
                setVal(`price-${i+1}`, item.fiyat);
            });
        }
        if (c.iletisim) {
            setVal('contact-label', c.iletisim.sectionLabel);
            setVal('contact-title', c.iletisim.title);
            setVal('contact-phone', c.iletisim.telefon);
            setVal('contact-email', c.iletisim.email);
            setVal('contact-address', c.iletisim.adres);
            setVal('contact-hours', c.iletisim.saatler);
            setVal('contact-whatsapp', c.iletisim.whatsapp);
            setVal('contact-map', c.iletisim.mapEmbedUrl);
            $('#contact-whatsapp-form-toggle').checked = c.iletisim.isWhatsAppForm;
            setVal('contact-whatsapp-template', c.iletisim.whatsappMessageTemplate);
        } else {
            $('#contact-whatsapp-form-toggle').checked = false;
        }
        if (c.footer) {
            setVal('footer-tagline', c.footer.tagline);
            setVal('footer-copyright', c.footer.copyright);
            setVal('footer-powered', c.footer.poweredBy);
        }
        if (c.seo) {
            setVal('seo-title', c.seo.title);
            setVal('seo-desc', c.seo.description);
            setVal('seo-keywords', c.seo.keywords);
            setVal('seo-canonical', c.seo.canonical);
            setVal('seo-ogimage', c.seo.ogImage);
        }
        if (c.sosyalMedya) {
            const ig = c.sosyalMedya.find(s => s.platform === 'instagram');
            const wa = c.sosyalMedya.find(s => s.platform === 'whatsapp');
            setVal('social-instagram', ig?.url || '');
            setVal('social-whatsapp', wa?.url || '');
        }
        renderCardEditor('programs-editor', c.programlar?.items || [], 'programlar');
    };

    // ─── MEDIA UPLOAD HELPERS ───
    const handleFileUpload = async (fileInput, targetInputId) => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            toast('Dosya yükleniyor...', 'info');
            const res = await fetch(API.upload, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: formData
            });
            const result = await res.json();
            if (result.success) {
                $(`#${targetInputId}`).value = result.data.url;
                toast('Yükleme başarılı!');
            } else {
                toast(result.message, 'error');
            }
        } catch {
            toast('Yükleme sırasında bir hata oluştu', 'error');
        }
    };

    const setupUploadListeners = () => {
        const maps = {
            'hero-video-file': 'hero-video',
            'hero-webm-file': 'hero-webm',
            'about-image-file': 'about-image',
            'seo-ogimage-file': 'seo-ogimage'
        };
        Object.entries(maps).forEach(([inputId, targetId]) => {
            $(`#${inputId}`)?.addEventListener('change', (e) => handleFileUpload(e.target, targetId));
        });
    };

    const renderCardEditor = (containerId, items, sectionName) => {
        const container = $(`#${containerId}`);
        if (!container) return;
        container.innerHTML = items.map((item, i) => `
            <div class="card-item bg-brandDark p-4 rounded-xl border border-neutral-800 space-y-3" data-section="${sectionName}" data-index="${i}">
                <div class="flex gap-4">
                    <div class="flex-1 space-y-2">
                        <input type="text" class="card-title w-full bg-transparent border border-neutral-800 rounded-lg px-3 py-2 text-sm" value="${item.title || ''}" placeholder="Başlık">
                        <textarea class="card-desc w-full bg-transparent border border-neutral-800 rounded-lg px-3 py-2 text-sm h-20" placeholder="Açıklama">${item.description || ''}</textarea>
                    </div>
                    <div class="w-1/3 space-y-2">
                        <input type="text" id="${sectionName}-img-${i}" class="card-img w-full bg-transparent border border-neutral-800 rounded-lg px-3 py-2 text-[10px]" value="${item.image || ''}" placeholder="Resim URL">
                        <input type="file" id="${sectionName}-file-${i}" class="hidden" onchange="Admin.handleCardUpload(this, '${sectionName}-img-${i}')">
                        <button onclick="$('#${sectionName}-file-${i}').click()" class="w-full py-2 bg-neutral-800 rounded-lg text-xs hover:bg-neutral-700 transition">Fotoğraf Yükle</button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const saveSection = async (section, data) => {
        try {
            const res = await api(API.content, { method: 'POST', body: JSON.stringify({ [section]: data }) });
            if (res.success) { toast('Kaydedildi!'); contentData = res.data; }
            else toast(res.message, 'error');
        } catch { toast('Kaydetme hatası', 'error'); }
    };

    const saveHero = () => saveSection('hero', {
        tagline: $('#hero-tagline').value,
        titleLine1: $('#hero-title1').value,
        titleLine2: $('#hero-title2').value,
        description: $('#hero-desc').value,
        videoUrl: $('#hero-video').value,
        ctaPrimary: $('#hero-cta1').value,
        ctaSecondary: $('#hero-cta2').value
    });

    const saveAbout = () => saveSection('hakkimizda', {
        sectionLabel: $('#about-label').value,
        title: $('#about-title').value,
        subtitle: $('#about-subtitle').value,
        text1: $('#about-text1').value,
        text2: $('#about-text2').value,
        imageUrl: $('#about-image').value
    });

    const saveNews = () => {
        const items = [...$$('[data-section="haberler"]')].map((el, i) => ({
            title: el.querySelector('.card-title').value,
            description: el.querySelector('.card-desc').value,
            image: el.querySelector('.card-img').value,
            order: i + 1
        }));
        const randomFacts = ($('#news-facts').value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        saveSection('haberler', {
            ...(contentData.haberler || {}),
            sectionLabel: $('#news-label').value,
            title: $('#news-title').value,
            intro: $('#news-intro').value,
            randomFacts,
            items
        });
    };

    const savePrices = () => saveSection('paketler', {
        ...contentData.paketler,
        items: contentData.paketler.items.map((item, i) => ({
            ...item,
            fiyat: Number($(`#price-${i+1}`).value)
        }))
    });

    const saveContact = () => {
        const phone = $('#contact-phone').value;
        const phoneRaw = phone.replace(/\D/g, '');
        return saveSection('iletisim', {
            ...contentData.iletisim,
            sectionLabel: $('#contact-label').value,
            title: $('#contact-title').value,
            telefon: phone,
            telefonRaw: phoneRaw,
            email: $('#contact-email').value,
            adres: $('#contact-address').value,
            saatler: $('#contact-hours').value,
            whatsapp: $('#contact-whatsapp').value,
            mapEmbedUrl: $('#contact-map').value,
            isWhatsAppForm: $('#contact-whatsapp-form-toggle').checked,
            whatsappMessageTemplate: $('#contact-whatsapp-template').value
        });
    };

    const saveFooter = () => saveSection('footer', {
        ...contentData.footer,
        tagline: $('#footer-tagline').value,
        copyright: $('#footer-copyright').value,
        poweredBy: $('#footer-powered').value
    });

    const saveSEO = () => saveSection('seo', {
        title: $('#seo-title').value,
        description: $('#seo-desc').value,
        keywords: $('#seo-keywords').value,
        canonical: $('#seo-canonical').value,
        ogImage: $('#seo-ogimage').value
    });

    const saveSocial = () => saveSection('sosyalMedya', [
        { platform: 'instagram', url: $('#social-instagram').value, isActive: true },
        { platform: 'whatsapp', url: $('#social-whatsapp').value, isActive: true }
    ]);

    const savePrograms = () => {
        const items = [...$$('[data-section="programlar"]')].map(el => ({
            title: el.querySelector('.card-title').value,
            description: el.querySelector('.card-desc').value,
            image: el.querySelector('.card-img').value
        }));
        saveSection('programlar', { ...contentData.programlar, items });
    };

    // ─── LEADS ───
    const loadLeads = async () => {
        try {
            const res = await api(API.contacts);
            if (!res.success) return;
            const leads = res.data;
            $('#stat-total').textContent = leads.length;
            $('#stat-pending').textContent = leads.filter(l => l.durum === 'Beklemede').length;
            $('#stat-completed').textContent = leads.filter(l => l.durum === 'Arandı').length;

            const container = $('#leads-container');
            if (!leads.length) {
                container.innerHTML = '<p class="text-xs text-neutral-500 italic p-4">Henüz başvuru yok.</p>';
                return;
            }

            container.innerHTML = leads.map(lead => {
                const tarih = new Date(lead.createdAt).toLocaleString('tr-TR');
                const colors = { Beklemede: 'border-l-amber-500', Arandı: 'border-l-emerald-500', İptal: 'border-l-red-500' };
                const actions = lead.durum === 'Beklemede' ? `
                    <button onclick="Admin.updateLead('${lead._id}','Arandı')" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500 hover:text-black transition">Arandı</button>
                    <button onclick="Admin.updateLead('${lead._id}','İptal')" class="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500 hover:text-white transition">İptal</button>
                ` : `<span class="text-xs text-neutral-500 italic">${lead.durum}</span>`;

                return `<div class="bg-brandCard p-4 rounded-xl border border-neutral-900 border-l-2 ${colors[lead.durum]} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center gap-2"><h3 class="text-sm font-bold text-white">${lead.adSoyad}</h3><span class="text-[9px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">${lead.durum}</span></div>
                        <p class="text-xs text-neutral-400 mt-1">${lead.telefon} · <span class="text-brandGold">${lead.brans}</span></p>
                        <p class="text-[10px] text-neutral-600 mt-1">${tarih}</p>
                    </div>
                    <div class="flex gap-2">${actions}</div>
                </div>`;
            }).join('');
        } catch { toast('Başvurular yüklenemedi', 'error'); }
    };

    const updateLead = async (id, durum) => {
        await api(`${API.contacts}/${id}`, { method: 'PUT', body: JSON.stringify({ durum }) });
        loadLeads();
        toast('Durum güncellendi');
    };

    // ─── BLOG ───
    const loadBlogPosts = async () => {
        try {
            const res = await api(`${API.blog}/admin/all`);
            if (!res.success) return;
            const container = $('#blog-list');
            if (!res.data.length) {
                container.innerHTML = '<p class="text-xs text-neutral-500 italic">Henüz blog yazısı yok.</p>';
                return;
            }
            container.innerHTML = res.data.map(post => `
                <div class="bg-brandCard p-4 rounded-xl border border-neutral-900 flex justify-between items-center">
                    <div>
                        <h3 class="text-sm font-bold text-white">${post.title}</h3>
                        <p class="text-[10px] text-neutral-500">${post.isPublished ? 'Yayında' : 'Taslak'} · ${new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="Admin.editBlog('${post._id}')" class="text-xs text-brandGold hover:underline">Düzenle</button>
                        <button onclick="Admin.deleteBlog('${post._id}')" class="text-xs text-red-400 hover:underline">Sil</button>
                    </div>
                </div>
            `).join('');
        } catch {}
    };

    const saveBlog = async () => {
        const data = {
            title: $('#blog-title').value,
            slug: $('#blog-slug').value || $('#blog-title').value.toLowerCase().replace(/\s+/g, '-'),
            excerpt: $('#blog-excerpt').value,
            content: $('#blog-content').value,
            isPublished: $('#blog-published').checked,
            seo: { metaTitle: $('#blog-seo-title').value, metaDescription: $('#blog-seo-desc').value }
        };
        const id = $('#blog-edit-id').value;
        const url = id ? `${API.blog}/${id}` : API.blog;
        const method = id ? 'PUT' : 'POST';
        const res = await api(url, { method, body: JSON.stringify(data) });
        if (res.success) {
            toast('Blog yazısı kaydedildi');
            $('#blog-form').reset();
            $('#blog-edit-id').value = '';
            loadBlogPosts();
        }
    };

    const editBlog = async (id) => {
        const res = await api(`${API.blog}/admin/all`);
        const post = res.data.find(p => p._id === id);
        if (!post) return;
        $('#blog-edit-id').value = post._id;
        $('#blog-title').value = post.title;
        $('#blog-slug').value = post.slug;
        $('#blog-excerpt').value = post.excerpt;
        $('#blog-content').value = post.content;
        $('#blog-published').checked = post.isPublished;
        switchPanel('blog');
    };

    const deleteBlog = async (id) => {
        if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
        await api(`${API.blog}/${id}`, { method: 'DELETE' });
        loadBlogPosts();
        toast('Yazı silindi');
    };

    const initDashboard = async () => {
        await loadContent();
        await loadLeads();
        await loadBlogPosts();
    };

    // ─── INIT ───
    document.addEventListener('DOMContentLoaded', () => {
        $('#login-form')?.addEventListener('submit', login);
        $('#logout-btn')?.addEventListener('click', logout);

        $$('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchPanel(link.dataset.panel);
            });
        });

        $('#save-hero')?.addEventListener('click', saveHero);
        $('#save-about')?.addEventListener('click', saveAbout);
        $('#save-news')?.addEventListener('click', saveNews);
        $('#save-prices')?.addEventListener('click', savePrices);
        $('#save-contact')?.addEventListener('click', saveContact);
        $('#save-footer')?.addEventListener('click', saveFooter);
        $('#save-seo')?.addEventListener('click', saveSEO);
        $('#save-social')?.addEventListener('click', saveSocial);
        $('#save-programs')?.addEventListener('click', savePrograms);
        $('#save-blog')?.addEventListener('click', saveBlog);

        setupUploadListeners();
        checkAuth();
    });

    window.Admin = { updateLead, editBlog, deleteBlog, handleCardUpload: (input, targetId) => handleFileUpload(input, targetId) };
})();
