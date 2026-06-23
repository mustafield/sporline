/**
 * Sporline Admin Panel v2.0 - Stabilized Edition
 */
(function () {
    const { API } = window.SportlineConfig || {};
    let token = localStorage.getItem('sporline_token');
    let currentUser = null;
    let contentData = {};

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const esc = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/\"/g, '&quot;')
        .replace(/</g, '&lt;');

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const api = async (url, options = {}) => {
        try {
            const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
            
            if (res.status === 401) { 
                logout(); 
                throw new Error('Oturum süresi doldu'); 
            }
            
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`API İsteği Başarısız (${url}):`, err);
            throw err;
        }
    };

    const toast = (msg, type = 'success') => {
        const box = $('#toast-box');
        if (!box) return;
        box.textContent = msg;
        box.className = `fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xl transition-all duration-300 ${
            type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'
        }`;
        box.style.transform = 'translateY(0)';
        box.style.opacity = '1';
        setTimeout(() => {
            box.style.transform = 'translateY(20px)';
            box.style.opacity = '0';
        }, 3500);
    };

    const checkAuth = async () => {
        if (!token) {
            showLogin(true);
            return;
        }
        try {
            const res = await api(`${API.auth}/me`);
            if (res.success) {
                currentUser = res.data;
                showLogin(false);
                $('#user-name').textContent = currentUser.name || 'Admin';
                $('#user-avatar').textContent = String(currentUser.name || 'A').charAt(0);
                initDashboard();
            } else {
                logout();
            }
        } catch (err) {
            logout();
        }
    };

    const showLogin = (visible) => {
        if (visible) {
            $('#login-screen').classList.remove('hidden');
            $('#admin-sidebar').classList.add('hidden');
        } else {
            $('#login-screen').classList.add('hidden');
            $('#admin-sidebar').classList.remove('hidden');
        }
    };

    const login = async (e) => {
        e.preventDefault();
        const email = $('#login-email').value;
        const password = $('#login-password').value;
        try {
            const res = await api(`${API.auth}/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            if (res.success) {
                localStorage.setItem('sporline_token', res.token);
                token = res.token;
                toast('Giriş başarılı, yetkiler yüklendi.');
                await checkAuth();
            } else {
                toast(res.message || 'Giriş başarısız', 'error');
            }
        } catch (err) {
            toast('Sunucuya bağlanılamadı.', 'error');
        }
    };

    const logout = () => {
        localStorage.removeItem('sporline_token');
        token = null;
        currentUser = null;
        showLogin(true);
    };

    const switchPanel = (panelId) => {
        $$('.admin-panel').forEach(p => p.classList.add('hidden'));
        $$('.sidebar-link').forEach(l => l.classList.remove('active'));
        
        $(`#panel-${panelId}`)?.classList.remove('hidden');
        $(`[data-panel="${panelId}"]`)?.classList.add('active');
    };

    const initDashboard = async () => {
        await loadContent();
        await loadLeads();
        await loadBlogs();
    };

    const loadContent = async () => {
        try {
            const res = await api(API.content);
            if (res.success && res.data) {
                contentData = res.data;
                renderContent();
            }
        } catch (err) {
            toast('İçerik verileri yüklenemedi.', 'error');
        }
    };

    const renderContent = () => {
        // Hero
        const hero = contentData.hero || {};
        $('#hero-tagline').value = hero.tagline || '';
        $('#hero-video').value = hero.videoUrl || '';
        $('#hero-title1').value = hero.title1 || '';
        $('#hero-title2').value = hero.title2 || '';
        $('#hero-desc').value = hero.description || '';
        $('#hero-cta1').value = hero.cta1 || '';
        $('#hero-cta2').value = hero.cta2 || '';

        // About
        const about = contentData.hakkimizda || {};
        $('#about-label').value = about.label || '';
        $('#about-title').value = about.title || '';
        $('#about-subtitle').value = about.subtitle || '';
        $('#about-text1').value = about.paragraph1 || '';
        $('#about-text2').value = about.paragraph2 || '';
        $('#about-image').value = about.imageUrl || '';

        // Müzik Atamaları (YENİ)
        if (contentData.musics && Array.isArray(contentData.musics)) {
            $('#music-url-0').value = contentData.musics[0] || '';
            $('#music-url-1').value = contentData.musics[1] || '';
            $('#music-url-2').value = contentData.musics[2] || '';
        }

        // Marquee Duyurular
        const news = contentData.haberler || {};
        $('#news-text').value = Array.isArray(news.items) ? news.items.join('\n') : '';

        // Dinamik kart listeleri (Programlar, Paketler, Sporcular, Sponsorlar, Ürünler)
        renderProgramsCard(contentData.programlar?.items || []);
        renderPricesCard(contentData.paketler?.items || []);
        renderAthletesCard(contentData.milliSporcular?.items || []);
        renderProductsCard(contentData.urunler?.items || []);
        renderSponsorsCard(contentData.sponsorlar?.items || []);

        // İletişim, Sosyal, Footer, SEO
        const contact = contentData.iletisim || {};
        $('#contact-phone').value = contact.phone || '';
        $('#contact-email').value = contact.email || '';
        $('#contact-address').value = contact.address || '';
        $('#contact-mapsrc').value = contact.mapSrc || '';
        $('#contact-hours').value = contact.hours || '';

        const social = contentData.sosyalMedya || {};
        $('#social-instagram').value = social.instagram || '';
        $('#social-whatsapp').value = social.whatsapp || '';
        $('#social-facebook').value = social.facebook || '';
        $('#social-youtube').value = social.youtube || '';

        const footer = contentData.footer || {};
        $('#footer-copy').value = footer.copyright || '';
        $('#footer-about').value = footer.aboutText || '';

        const seo = contentData.seo || {};
        $('#seo-title').value = seo.title || '';
        $('#seo-desc').value = seo.description || '';
        $('#seo-keywords').value = seo.keywords || '';
    };

    const handleFileUpload = async (fileInput, targetInputId) => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            toast('Dosya yükleniyor, bekleyin...');
            const res = await fetch(`${SportlineConfig.API_BASE}/api/upload`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: formData
            });
            const data = await res.json();
            if (data.success && data.url) {
                $(`#${targetInputId}`).value = data.url;
                toast('Dosya başarıyla yüklendi!');
            } else {
                toast(data.message || 'Yükleme başarısız', 'error');
            }
        } catch (err) {
            toast('Dosya yükleme ağ hatası.', 'error');
        }
    };

    const setupUploadListeners = () => {
        $('#hero-video-file')?.addEventListener('change', function() { handleFileUpload(this, 'hero-video'); });
        $('#about-image-file')?.addEventListener('change', function() { handleFileUpload(this, 'about-image'); });
        $('#blog-image-file')?.addEventListener('change', function() { handleFileUpload(this, 'blog-image'); });
    };

    // --- GLOBAL ORTAK KAYDETME MOTORU ---
    const commitSectionUpdate = async (sectionName, payloadObject, buttonId) => {
        const btn = $(`#${buttonId}`);
        const orig = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'KAYDEDİLİYOR...';
        try {
            const res = await api(API.content, {
                method: 'POST',
                body: JSON.stringify({ [sectionName]: payloadObject })
            });
            if (res.success) {
                toast('Değişiklikler başarıyla kaydedildi.');
                await loadContent();
            } else {
                toast(res.message || 'Hata oluştu', 'error');
            }
        } catch (e) {
            toast('Bağlantı hatası.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = orig;
        }
    };

    const saveHero = () => {
        commitSectionUpdate('hero', {
            tagline: $('#hero-tagline').value,
            videoUrl: $('#hero-video').value,
            title1: $('#hero-title1').value,
            title2: $('#hero-title2').value,
            description: $('#hero-desc').value,
            cta1: $('#hero-cta1').value,
            cta2: $('#hero-cta2').value
        }, 'save-hero');
    };

    const saveAbout = () => {
        commitSectionUpdate('hakkimizda', {
            label: $('#about-label').value,
            title: $('#about-title').value,
            subtitle: $('#about-subtitle').value,
            paragraph1: $('#about-text1').value,
            paragraph2: $('#about-text2').value,
            imageUrl: $('#about-image').value
        }, 'save-about');
    };

    const saveMusics = () => {
        const musicsArray = [
            $('#music-url-0').value.trim(),
            $('#music-url-1').value.trim(),
            $('#music-url-2').value.trim()
        ].filter(u => u !== '');
        commitSectionUpdate('musics', musicsArray, 'save-musics');
    };

    const saveNews = () => {
        const lines = $('#news-text').value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        commitSectionUpdate('haberler', { items: lines }, 'save-news');
    };

    const saveContact = () => {
        commitSectionUpdate('iletisim', {
            phone: $('#contact-phone').value,
            email: $('#contact-email').value,
            address: $('#contact-address').value,
            mapSrc: $('#contact-mapsrc').value,
            hours: $('#contact-hours').value
        }, 'save-contact');
    };

    const saveSocial = () => {
        commitSectionUpdate('sosyalMedya', {
            instagram: $('#social-instagram').value,
            whatsapp: $('#social-whatsapp').value,
            facebook: $('#social-facebook').value,
            youtube: $('#social-youtube').value
        }, 'save-social');
    };

    const saveFooter = () => {
        commitSectionUpdate('footer', {
            copyright: $('#footer-copy').value,
            aboutText: $('#footer-about').value
        }, 'save-footer');
    };

    const saveSEO = () => {
        commitSectionUpdate('seo', {
            title: $('#seo-title').value,
            description: $('#seo-desc').value,
            keywords: $('#seo-keywords').value
        }, 'save-seo');
    };

    // --- DİNAMİK KART LİSTELERİ SİHİRBAZLARI ---
    const renderProgramsCard = (items) => {
        let html = '';
        items.forEach((item, index) => {
            html += `
            <div class="border border-neutral-900 bg-neutral-950/20 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center" data-idx="${index}">
                <div class="text-xs font-bold text-brandGold uppercase">Program #${index+1}</div>
                <div><input class="form-input p-sub-title" value="${esc(item.title)}" placeholder="Başlık"></div>
                <div><input class="form-input p-sub-desc" value="${esc(item.description)}" placeholder="Açıklama"></div>
                <div>
                    <div class="flex gap-1.5">
                        <input class="form-input p-sub-img" id="prog-img-${index}" value="${esc(item.imageUrl)}" placeholder="Görsel URL">
                        <input type="file" id="prog-file-${index}" class="hidden" accept="image/*" onchange="Admin.handleCardUpload(this, 'prog-img-${index}')">
                        <button type="button" onclick="document.getElementById('prog-file-${index}').click()" class="bg-neutral-800 text-white px-2.5 rounded-lg text-[11px]">Yükle</button>
                    </div>
                </div>
            </div>`;
        });
        $('#programs-container').innerHTML = html;
    };

    const savePrograms = () => {
        const items = [];
        $$('#programs-container > div').forEach(row => {
            items.push({
                title: row.querySelector('.p-sub-title').value,
                description: row.querySelector('.p-sub-desc').value,
                imageUrl: row.querySelector('.p-sub-img').value
            });
        });
        commitSectionUpdate('programlar', { items }, 'save-programs');
    };

    const renderPricesCard = (items) => {
        let html = '';
        items.forEach((item, index) => {
            html += `
            <div class="border border-neutral-900 bg-neutral-950/20 p-4 rounded-xl space-y-3">
                <div class="text-xs font-bold text-brandGold uppercase">Paket #${index+1}</div>
                <div><input class="form-input pr-title" value="${esc(item.title)}" placeholder="Paket Adı"></div>
                <div><input class="form-input pr-price" value="${esc(item.price)}" placeholder="Fiyat"></div>
                <div><input class="form-input pr-period" value="${esc(item.period)}" placeholder="Süre (Örn: / Aylık)"></div>
                <div><textarea class="form-input h-20 pr-feat" placeholder="Özellikler (Her satıra bir tane)">${esc(Array.isArray(item.features)? item.features.join('\n'):'')}</textarea></div>
                <div class="flex items-center gap-2"><input type="checkbox" class="pr-pop" ${item.popular?'checked':''}> <span class="text-xs">Popüler Paket</span></div>
            </div>`;
        });
        $('#prices-container').innerHTML = html;
    };

    const savePrices = () => {
        const items = [];
        $$('#prices-container > div').forEach(box => {
            items.push({
                title: box.querySelector('.pr-title').value,
                price: box.querySelector('.pr-price').value,
                period: box.querySelector('.pr-period').value,
                features: box.querySelector('.pr-feat').value.split('\n').map(f=>f.trim()).filter(f=>f.length>0),
                popular: box.querySelector('.pr-pop').checked
            });
        });
        commitSectionUpdate('paketler', { items }, 'save-prices');
    };

    const renderAthletesCard = (items) => {
        let html = '';
        items.forEach((item, index) => {
            html += `
            <div class="border border-neutral-900 bg-neutral-950/20 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div class="text-xs font-bold text-brandGold uppercase">Sporcu #${index+1}</div>
                <div><input class="form-input ath-name" value="${esc(item.name)}" placeholder="Adı Soyadı"></div>
                <div><input class="form-input ath-title" value="${esc(item.title)}" placeholder="Ünvan / Derece"></div>
                <div>
                    <div class="flex gap-1.5">
                        <input class="form-input ath-img" id="ath-img-${index}" value="${esc(item.imageUrl)}" placeholder="Görsel URL">
                        <input type="file" id="ath-file-${index}" class="hidden" accept="image/*" onchange="Admin.handleCardUpload(this, 'ath-img-${index}')">
                        <button type="button" onclick="document.getElementById('ath-file-${index}').click()" class="bg-neutral-800 text-white px-2.5 rounded-lg text-[11px]">Yükle</button>
                    </div>
                </div>
            </div>`;
        });
        $('#athletes-container').innerHTML = html;
    };

    const saveAthletes = () => {
        const items = [];
        $$('#athletes-container > div').forEach(row => {
            items.push({
                name: row.querySelector('.ath-name').value,
                title: row.querySelector('.ath-title').value,
                imageUrl: row.querySelector('.ath-img').value
            });
        });
        commitSectionUpdate('milliSporcular', { items }, 'save-athletes');
    };

    const renderProductsCard = (items) => {
        let html = '';
        items.forEach((item, index) => {
            html += `
            <div class="border border-neutral-900 bg-neutral-950/20 p-4 rounded-xl space-y-3">
                <div class="text-xs font-bold text-brandGold uppercase">Ürün #${index+1}</div>
                <div><input class="form-input prod-title" value="${esc(item.title)}" placeholder="Ürün Adı"></div>
                <div><input class="form-input prod-price" value="${esc(item.price)}" placeholder="Fiyat (Sadece Sayı)"></div>
                <div>
                    <div class="flex gap-1.5">
                        <input class="form-input prod-img" id="prod-img-${index}" value="${esc(item.imageUrl)}" placeholder="Görsel URL">
                        <input type="file" id="prod-file-${index}" class="hidden" accept="image/*" onchange="Admin.handleCardUpload(this, 'prod-img-${index}')">
                        <button type="button" onclick="document.getElementById('prod-file-${index}').click()" class="bg-neutral-800 text-white px-2.5 rounded-lg text-[11px]">Yükle</button>
                    </div>
                </div>
            </div>`;
        });
        $('#products-container').innerHTML = html;
    };

    const saveProducts = () => {
        const items = [];
        $$('#products-container > div').forEach(box => {
            items.push({
                title: box.querySelector('.prod-title').value,
                price: Number(box.querySelector('.prod-price').value || 0),
                imageUrl: box.querySelector('.prod-img').value
            });
        });
        commitSectionUpdate('urunler', { items }, 'save-products');
    };

    const renderSponsorsCard = (items) => {
        let html = '';
        items.forEach((item, index) => {
            html += `
            <div class="border border-neutral-900 bg-neutral-950/20 p-3 rounded-xl space-y-2">
                <div class="text-[10px] font-bold text-neutral-500 uppercase">Logo #${index+1}</div>
                <div class="flex gap-1">
                    <input class="form-input sp-img text-[10px]" id="spon-img-${index}" value="${esc(item.imageUrl)}" placeholder="Logo URL">
                    <input type="file" id="spon-file-${index}" class="hidden" accept="image/*" onchange="Admin.handleCardUpload(this, 'spon-img-${index}')">
                    <button type="button" onclick="document.getElementById('spon-file-${index}').click()" class="bg-neutral-800 text-white px-1.5 rounded-md text-[10px]">Seç</button>
                </div>
            </div>`;
        });
        $('#sponsors-container').innerHTML = html;
    };

    const saveSponsors = () => {
        const items = [];
        $$('#sponsors-container > div').forEach(box => {
            items.push({ imageUrl: box.querySelector('.sp-img').value });
        });
        commitSectionUpdate('sponsorlar', { items }, 'save-sponsors');
    };

    // --- LEADS TALEP YÖNETİMİ ---
    const loadLeads = async () => {
        try {
            const res = await api(SportlineConfig.API.contacts);
            if (res.success && res.data) {
                renderLeads(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const renderLeads = (leads) => {
        const tbody = $('#leads-table-body');
        if (!leads.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-neutral-500">Kayıtlı istek bulunamadı.</td></tr>`;
            return;
        }
        let html = '';
        leads.forEach(l => {
            const dateStr = new Date(l.createdAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            html += `
            <tr class="hover:bg-neutral-950/20 transition duration-150">
                <td class="p-4 font-semibold text-white">${esc(l.name)}</td>
                <td class="p-4 space-y-0.5">
                    <div class="text-neutral-200">${esc(l.email)}</div>
                    <div class="text-neutral-500 text-[11px]">${esc(l.phone)}</div>
                </td>
                <td class="p-4"><span class="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md text-[10px] font-bold text-brandGold uppercase">${esc(l.subject)}</span></td>
                <td class="p-4 max-w-xs truncate" title="${esc(l.message)}">${esc(l.message)}</td>
                <td class="p-4 text-neutral-400 text-[11px]">${dateStr}</td>
                <td class="p-4 text-right">
                    ${l.status === 'read' 
                        ? `<span class="text-emerald-400 font-semibold text-[11px]">Okundu</span>`
                        : `<button onclick="Admin.updateLead('${l._id}')" class="bg-brandGold text-brandDark px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-white">Okundu İşaretle</button>`
                    }
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    };

    const updateLead = async (id) => {
        try {
            const res = await api(`${SportlineConfig.API.contacts}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'read' })
            });
            if (res.success) {
                toast('Talep okundu olarak işaretlendi.');
                loadLeads();
            }
        } catch (e) {
            toast('İşlem başarısız.', 'error');
        }
    };

    // --- BLOG MANAGEMENT (CRUD) ---
    const loadBlogs = async () => {
        try {
            const res = await api(`${SportlineConfig.API_BASE}/api/blog`);
            if (res.success && res.data) {
                renderBlogsTable(res.data);
            }
        } catch (e) { console.error(e); }
    };

    const renderBlogsTable = (blogs) => {
        const tbody = $('#blogs-table-body');
        if(!blogs.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-neutral-500">Yazı bulunamadı.</td></tr>`;
            return;
        }
        let html = '';
        blogs.forEach(b => {
            const d = new Date(b.createdAt).toLocaleDateString('tr-TR');
            html += `
            <tr class="hover:bg-neutral-950/20">
                <td class="p-3"><img src="${esc(b.imageUrl)}" class="w-10 h-10 object-cover rounded-lg border border-neutral-900"></td>
                <td class="p-3 font-semibold text-white max-w-xs truncate">${esc(b.title)}</td>
                <td class="p-3 text-neutral-400">${esc(b.category)}</td>
                <td class="p-3 text-neutral-500 text-[11px]">${d}</td>
                <td class="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button onclick="Admin.editBlog('${b._id}')" class="text-brandGold hover:underline font-medium">Düzenle</button>
                    <button onclick="Admin.deleteBlog('${b._id}')" class="text-red-500 hover:underline font-medium">Sil</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    };

    const saveBlog = async () => {
        const id = $('#blog-id').value;
        const payload = {
            title: $('#blog-title').value,
            category: $('#blog-category').value,
            imageUrl: $('#blog-image').value,
            readTime: $('#blog-readtime').value,
            summary: $('#blog-summary').value,
            content: $('#blog-content').value
        };

        const isEdit = id && id.length > 0;
        const url = isEdit ? `${SportlineConfig.API_BASE}/api/blog/${id}` : `${SportlineConfig.API_BASE}/api/blog`;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await api(url, { method, body: JSON.stringify(payload) });
            if(res.success) {
                toast(isEdit ? 'Blog başarıyla güncellendi' : 'Yeni blog yazısı yayınlandı');
                resetBlogForm();
                loadBlogs();
            } else {
                toast(res.message || 'Başarısız', 'error');
            }
        } catch(e) { toast('Blog kaydedilemedi.', 'error'); }
    };

    const editBlog = async (id) => {
        try {
            const res = await api(`${SportlineConfig.API_BASE}/api/blog/${id}`);
            if(res.success && res.data) {
                const b = res.data;
                $('#blog-id').value = b._id;
                $('#blog-title').value = b.title || '';
                $('#blog-category').value = b.category || '';
                $('#blog-image').value = b.imageUrl || '';
                $('#blog-readtime').value = b.readTime || '';
                $('#blog-summary').value = b.summary || '';
                $('#blog-content').value = b.content || '';

                $('#blog-form-title').textContent = 'Blog Yazısını Düzenle';
                $('#cancel-blog-edit').classList.remove('hidden');
                switchPanel('blog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch(e) { toast('Yazı detayları çekilemedi.', 'error'); }
    };

    const deleteBlog = async (id) => {
        if(!confirm('Bu blog yazısını kalıcı olarak silmek istediğinize emin misiniz?')) return;
        try {
            const res = await api(`${SportlineConfig.API_BASE}/api/blog/${id}`, { method: 'DELETE' });
            if(res.success) {
                toast('Yazı silindi.');
                loadBlogs();
            }
        } catch(e) { toast('Silme işlemi başarısız.', 'error'); }
    };

    const resetBlogForm = () => {
        $('#blog-id').value = '';
        $('#blog-title').value = '';
        $('#blog-category').value = '';
        $('#blog-image').value = '';
        $('#blog-readtime').value = '';
        $('#blog-summary').value = '';
        $('#blog-content').value = '';
        $('#blog-form-title').textContent = 'Yeni Blog Yazısı Ekle';
        $('#cancel-blog-edit').classList.add('hidden');
    };

    // --- EVENT LISTENERS INITIALIZATION ---
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
        $('#save-musics')?.addEventListener('click', saveMusics);
        $('#save-news')?.addEventListener('click', saveNews);
        $('#save-prices')?.addEventListener('click', savePrices);
        $('#save-contact')?.addEventListener('click', saveContact);
        $('#save-footer')?.addEventListener('click', saveFooter);
        $('#save-seo')?.addEventListener('click', saveSEO);
        $('#save-social')?.addEventListener('click', saveSocial);
        $('#save-programs')?.addEventListener('click', savePrograms);
        $('#save-athletes')?.addEventListener('click', saveAthletes);
        $('#save-products')?.addEventListener('click', saveProducts);
        $('#save-sponsors')?.addEventListener('click', saveSponsors);
        $('#save-blog')?.addEventListener('click', saveBlog);
        $('#cancel-blog-edit')?.addEventListener('click', resetBlogForm);

        setupUploadListeners();
        checkAuth();
    });

    // IIFE dışına güvenli export (Dinamik HTML element olayları için şart)
    window.Admin = { 
        updateLead, 
        editBlog, 
        deleteBlog, 
        handleCardUpload: (input, targetId) => handleFileUpload(input, targetId) 
    };
})();