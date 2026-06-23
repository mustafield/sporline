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
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})\
    });

    const api = async (url, options = {}) => {
        try {
            const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
            
            if (res.status === 401) { \
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
        let t = $('#admin-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'admin-toast';
            t.className = 'fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all duration-300 translate-y-10 opacity-0';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.className = `fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all duration-300 ${
            type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`;
        requestAnimationFrame(() => {
            t.style.transform = 'translateY(0)';
            t.style.opacity = '1';
        });
        setTimeout(() => {
            t.style.transform = 'translateY(10px)';
            t.style.opacity = '0';
        }, 3500);
    };

    const showLogin = (visible) => {
        if (visible) {
            $('#login-screen').classList.remove('hidden');
            $('#admin-sidebar').classList.add('hidden');
            $('#admin-main').classList.add('hidden');
        } else {
            $('#login-screen').classList.add('hidden');
            $('#admin-sidebar').classList.remove('hidden');
            $('#admin-main').classList.remove('hidden');
        }
    };

    const checkAuth = async () => {
        if (!token) return showLogin(true);
        try {
            const res = await api(`${API.contacts}/me`); // Örnek auth check endpointi
            if (res && res.user) {
                currentUser = res.user;
                $('#user-name').textContent = currentUser.name || 'Yönetici';
                showLogin(false);
                initDashboard();
            } else {
                logout();
            }
        } catch {
            logout();
        }
    };

    const login = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Giriş Yapılıyor...';

        const email = $('#login-email').value.trim();
        const password = $('#login-password').value.trim();

        try {
            const res = await fetch(`${API.contacts}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok && data.token) {
                localStorage.setItem('sporline_token', data.token);
                token = data.token;
                toast('Giriş başarılı, panel yükleniyor...');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast(data.message || 'Giriş bilgileri hatalı', 'error');
            }
        } catch (err) {
            toast('Sunucuyla bağlantı kurulamadı', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    };

    const logout = () => {
        localStorage.removeItem('sporline_token');
        token = null;
        currentUser = null;
        showLogin(true);
    };

    const initDashboard = async () => {
        try {
            await loadContent();
            await loadLeads();
            switchPanel('hero');
        } catch (err) {
            toast('Veriler yüklenirken bir hata oluştu', 'error');
        }
    };

    const switchPanel = (panelId) => {
        $$('.panel-content').forEach(p => p.classList.add('hidden'));
        $$('.sidebar-link').forEach(l => l.classList.remove('bg-brandGray', 'text-brandGold'));
        
        $(`#panel-${panelId}`)?.classList.remove('hidden');
        $(`[data-panel="${panelId}"]`)?.classList.add('bg-brandGray', 'text-brandGold');
    };

    const loadLeads = async () => {
        try {
            const data = await api(API.contacts);
            const tbody = $('#leads-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">Henüz başvuru bulunmuyor.</td></tr>`;
                return;
            }

            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(lead => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors';
                tr.innerHTML = `
                    <td class="px-6 py-4 text-sm font-medium text-white">${esc(lead.name)}</td>
                    <td class="px-6 py-4 text-sm text-gray-400">${esc(lead.phone)}</td>
                    <td class="px-6 py-4 text-sm text-gray-400">${esc(lead.program || 'Belirtilmedi')}</td>
                    <td class="px-6 py-4 text-sm text-gray-400">${new Date(lead.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td class="px-6 py-4 text-sm">
                        <select onchange="Admin.updateLead('${lead._id}', this.value)" class="bg-brandDark border border-white/10 rounded-lg px-2 py-1 text-xs font-medium text-gray-300 focus:outline-none focus:border-brandGold transition-colors">
                            <option value="Beklemede" ${lead.status === 'Beklemede' ? 'selected' : ''}>Beklemede</option>
                            <option value="Arandı" ${lead.status === 'Arandı' ? 'selected' : ''}>Arandı</option>
                            <option value="İptal" ${lead.status === 'İptal' ? 'selected' : ''}>İptal</option>
                        </select>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Başvurular yüklenemedi:', err);
        }
    };

    const updateLead = async (id, status) => {
        try {
            await api(`${API.contacts}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            toast('Başvuru durumu güncellendi');
        } catch {
            toast('Durum güncellenirken hata oluştu', 'error');
        }
    };

    const loadContent = async () => {
        contentData = await api(API.content);
        fillForms();
    };

    const fillForms = () => {
        if (!contentData) return;

        // Hero
        if (contentData.hero) {
            $('#hero-title').value = contentData.hero.title || '';
            $('#hero-subtitle').value = contentData.hero.subtitle || '';
            $('#hero-bg-preview').src = contentData.hero.bgImage || '';
        }

        // About
        if (contentData.about) {
            $('#about-title').value = contentData.about.title || '';
            $('#about-desc1').value = contentData.about.description1 || '';
            $('#about-desc2').value = contentData.about.description2 || '';
            $('#about-img-preview').src = contentData.about.image || '';
        }

        // Musics
        if (contentData.musics && Array.isArray(contentData.musics)) {
            for (let i = 0; i < 3; i++) {
                const m = contentData.musics[i] || {};
                $(`#music-title-${i}`).value = m.title || '';
                $(`#music-artist-${i}`).value = m.artist || '';
                $(`#music-url-${i}`).value = m.url || '';
            }
        }

        // News (Duyurular)
        if (contentData.news) {
            $('#news-text').value = contentData.news.text || '';
            $('#news-active').checked = !!contentData.news.isActive;
        }

        // Prices
        if (contentData.prices && Array.isArray(contentData.prices)) {
            contentData.prices.forEach((p, idx) => {
                $(`#price-title-${idx}`).value = p.title || '';
                $(`#price-amt-${idx}`).value = p.amount || '';
                $(`#price-period-${idx}`).value = p.period || '';
                if (Array.isArray(p.features)) {
                    $(`#price-feat-${idx}`).value = p.features.join('\n');
                }
            });
        }

        // Contact & Footer
        if (contentData.contact) {
            $('#contact-phone').value = contentData.contact.phone || '';
            $('#contact-email').value = contentData.contact.email || '';
            $('#contact-address').value = contentData.contact.address || '';
            $('#contact-maps').value = contentData.contact.mapsUrl || '';
        }
        if (contentData.footer) {
            $('#footer-text').value = contentData.footer.text || '';
        }

        // SEO
        if (contentData.seo) {
            $('#seo-title').value = contentData.seo.title || '';
            $('#seo-desc').value = contentData.seo.description || '';
            $('#seo-keys').value = contentData.seo.keywords || '';
        }

        // Social Links
        if (contentData.social) {
            $('#soc-ig').value = contentData.social.instagram || '';
            $('#soc-yt').value = contentData.social.youtube || '';
            $('#soc-wp').value = contentData.social.whatsapp || '';
        }

        // Programlar, Sporcular, Ürünler, Sponsorlar ve Blog listeleri
        renderArrayCards('programs', contentData.programs || [], ['title', 'subtitle', 'image']);
        renderArrayCards('athletes', contentData.athletes || [], ['name', 'title', 'image']);
        renderArrayCards('products', contentData.products || [], ['name', 'price', 'image', 'link']);
        renderArrayCards('sponsors', contentData.sponsors || [], ['name', 'logo']);
        renderBlogList(contentData.blogs || []);
    };

    const renderArrayCards = (type, array, fields) => {
        const container = $(`#${type}-container`);
        if (!container) return;
        container.innerHTML = '';

        array.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'bg-brandDark border border-white/5 rounded-2xl p-6 relative group hover:border-brandGold/20 transition-all duration-300';
            
            let inputsHTML = '';
            fields.forEach(field => {
                if (field === 'image' || field === 'logo') {
                    inputsHTML += `
                        <div class="space-y-2">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Görsel</label>
                            <div class="flex items-center gap-4">
                                <img id="${type}-preview-${index}" src="${item[field] || ''}" class="w-12 h-12 rounded-xl object-cover bg-brandGray border border-white/10 flex-shrink-0">
                                <input type="file" onchange="Admin.handleCardUpload(this, '#${type}-img-${index}')" class="hidden" id="${type}-file-${index}">
                                <label for="${type}-file-${index}" class="px-3 py-2 bg-brandGray hover:bg-white/[0.04] border border-white/10 rounded-xl text-xs font-medium text-gray-300 cursor-pointer transition-colors flex-1 text-center">Görsel Seç</label>
                                <input type="hidden" id="${type}-img-${index}" value="${item[field] || ''}">
                            </div>
                        </div>
                    `;
                } else if (field === 'features') {
                    inputsHTML += `
                        <div class="space-y-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Özellikler (Satır Satır)</label>
                            <textarea data-field="${field}" class="w-full bg-brandGray border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brandGold/40 transition-colors h-20">${Array.isArray(item[field]) ? item[field].join('\n') : ''}</textarea>
                        </div>
                    `;
                } else {
                    inputsHTML += `
                        <div class="space-y-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${field === 'title' ? 'Başlık' : field === 'subtitle' ? 'Alt Başlık' : field === 'name' ? 'Adı' : field === 'price' ? 'Fiyat' : 'Link'}</label>
                            <input type="text" data-field="${field}" value="${item[field] || ''}" class="w-full bg-brandGray border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brandGold/40 transition-colors">
                        </div>
                    `;
                }
            });

            card.innerHTML = `
                <button type="button" onclick="this.closest('.group').remove()" class="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 z-10">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <div class="space-y-4 pt-4">${inputsHTML}</div>
            `;
            container.appendChild(card);
        });
    };

    const getArrayData = (type, fields) => {
        const container = $(`#${type}-container`);
        if (!container) return [];
        const result = [];
        
        container.querySelectorAll('.group').forEach((card, index) => {
            const item = {};
            fields.forEach(field => {
                if (field === 'image' || field === 'logo') {
                    item[field] = card.querySelector(`[id^="${type}-img-"]`)?.value || '';
                } else if (field === 'features') {
                    const val = card.querySelector('textarea')?.value || '';
                    item[field] = val.split('\n').map(x => x.trim()).filter(Boolean);
                } else {
                    const input = card.querySelector(`input[data-field="${field}"], textarea[data-field="${field}"]`);
                    item[field] = input ? input.value.trim() : '';
                }
            });
            result.push(item);
        });
        return result;
    };

    const handleFileUpload = async (input, targetId) => {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        
        const previewImg = input.parentElement.querySelector('img');
        const label = input.parentElement.querySelector('label');
        const originalLabel = label.textContent;
        
        label.textContent = 'Yükleniyor...';
        
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                $(targetId).value = data.url;
                if (previewImg) previewImg.src = data.url;
                toast('Görsel başarıyla yüklendi');
            } else {
                toast(data.message || 'Yükleme başarısız', 'error');
            }
        } catch {
            toast('Görsel yüklenirken sunucu hatası oluştu', 'error');
        } finally {
            label.textContent = originalLabel;
        }
    };

    const setupUploadListeners = () => {
        $('#hero-file')?.addEventListener('change', function() { handleFileUpload(this, '#hero-bg-url'); });
        $('#about-file')?.addEventListener('change', function() { handleFileUpload(this, '#about-img-url'); });
        $('#blog-file')?.addEventListener('change', function() { handleFileUpload(this, '#blog-img-url'); });
    };

    const saveSection = async (section, data) => {
        try {
            await api(`${API.content}/${section}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            toast('Değişiklikler başarıyla kaydedildi');
        } catch {
            toast('Kaydedilirken bir hata oluştu', 'error');
        }
    };

    const saveHero = () => saveSection('hero', { title: $('#hero-title').value, subtitle: $('#hero-subtitle').value, bgImage: $('#hero-bg-url').value });
    const saveAbout = () => saveSection('about', { title: $('#about-title').value, description1: $('#about-desc1').value, description2: $('#about-desc2').value, image: $('#about-img-url').value });
    const saveNews = () => saveSection('news', { text: $('#news-text').value, isActive: $('#news-active').checked });
    const saveFooter = () => saveSection('footer', { text: $('#footer-text').value });
    const saveSEO = () => saveSection('seo', { title: $('#seo-title').value, description: $('#seo-desc').value, keywords: $('#seo-keys').value });
    const saveSocial = () => saveSection('social', { instagram: $('#soc-ig').value, youtube: $('#soc-yt').value, whatsapp: $('#soc-wp').value });
    const savePrograms = () => saveSection('programs', getArrayData('programs', ['title', 'subtitle', 'image']));
    const saveAthletes = () => saveSection('athletes', getArrayData('athletes', ['name', 'title', 'image']));
    const saveProducts = () => saveSection('products', getArrayData('products', ['name', 'price', 'image', 'link']));
    const saveSponsors = () => saveSection('sponsors', getArrayData('sponsors', ['name', 'logo']));

    const saveMusics = () => {
        const musics = [];
        for (let i = 0; i < 3; i++) {
            musics.push({ title: $(`#music-title-${i}`).value, artist: $(`#music-artist-${i}`).value, url: $(`#music-url-${i}`).value });
        }
        saveSection('musics', musics);
    };

    const savePrices = () => {
        const prices = [];
        for (let i = 0; i < 3; i++) {
            prices.push({
                title: $(`#price-title-${i}`).value,
                amount: $(`#price-amt-${i}`).value,
                period: $(`#price-period-${i}`).value,
                features: $(`#price-feat-${i}`).value.split('\n').map(x => x.trim()).filter(Boolean)
            });
        }
        saveSection('prices', prices);
    };

    const saveContact = () => {
        saveSection('contact', {
            phone: $('#contact-phone').value,
            email: $('#contact-email').value,
            address: $('#contact-address').value,
            mapsUrl: $('#contact-maps').value
        });
    };

    // ─── BLOG YÖNETİM MOTORU ───
    let editingBlogId = null;

    const renderBlogList = (blogs) => {
        const grid = $('#blog-list-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!blogs || blogs.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8 text-sm">Henüz blog yazısı eklenmemiş.</div>';
            return;
        }

        blogs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(b => {
            const card = document.createElement('div');
            card.className = 'bg-brandDark border border-white/5 rounded-2xl p-5 flex gap-4 items-center group hover:border-brandGold/20 transition-all';
            card.innerHTML = `
                <img src="${b.image || ''}" class="w-16 h-16 rounded-xl object-cover bg-brandGray border border-white/5 flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-white truncate">${esc(b.title)}</h4>
                    <p class="text-xs text-gray-500 mt-1">${new Date(b.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onclick="Admin.editBlog('${b._id}')" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center border border-white/10 transition-colors"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button type="button" onclick="Admin.editBlog('${b._id}')" class="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/10 transition-colors"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    const saveBlog = async () => {
        const title = $('#blog-title').value.trim();
        const content = $('#blog-content').value.trim();
        const image = $('#blog-img-url').value;

        if (!title || !content) return toast('Başlık ve içerik alanları zorunludur', 'error');

        try {
            if (editingBlogId) {
                await api(`${API_BASE}/api/blogs/${editingBlogId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ title, content, image })
                });
                toast('Yazı güncellendi');
            } else {
                await api(`${API_BASE}/api/blogs`, {
                    method: 'POST',
                    body: JSON.stringify({ title, content, image })
                });
                toast('Yeni blog yazısı yayınlandı');
            }
            resetBlogForm();
            loadContent(); // Listeyi yenile
        } catch {
            toast('Blog kaydedilirken hata oluştu', 'error');
        }
    };

    const editBlog = (id) => {
        const b = (contentData.blogs || []).find(x => x._id === id);
        if (!b) return;
        editingBlogId = id;
        $('#blog-title').value = b.title || '';
        $('#blog-content').value = b.content || '';
        $('#blog-img-url').value = b.image || '';
        $('#blog-img-preview').src = b.image || '';
        $('#blog-form-title').textContent = 'Yazıyı Düzenle';
        $('#cancel-blog-edit').classList.remove('hidden');
    };

    const deleteBlog = async (id) => {
        if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return;
        try {
            await api(`${API_BASE}/api/blogs/${id}`, { method: 'DELETE' });
            toast('Yazı başarıyla silindi');
            loadContent();
        } catch {
            toast('Yazı silinirken hata oluştu', 'error');
        }
    };

    const resetBlogForm = () => {
        editingBlogId = null;
        $('#blog-title').value = '';
        $('#blog-content').value = '';
        $('#blog-img-url').value = '';
        $('#blog-img-preview').src = '';
        $('#blog-form-title').textContent = 'Yeni Yazı Ekle';
        $('#cancel-blog-edit').classList.add('hidden');
    };

    // ─── GÜVENLİ OLAY DİNLEYİCİ BAĞLAMA MOTORU ───
    document.addEventListener('DOMContentLoaded', () => {
        // Giriş formu her şeyden bağımsız ilk önce bağlansın ki yarıda kesilmesin
        const loginForm = $('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', login);
        }

        const logoutBtn = $('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Sidebar linkleri
        $$('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchPanel(link.dataset.panel);
            });
        });

        // Eleman yoksa script çökmesin diye dinamik korumalı bağlama (safeBind)
        const safeBind = (id, fn) => {
            const el = $(id);
            if (el) el.addEventListener('click', fn);
        };

        safeBind('#save-hero', saveHero);
        safeBind('#save-about', saveAbout);
        safeBind('#save-musics', saveMusics);
        safeBind('#save-news', saveNews);
        safeBind('#save-prices', savePrices);
        safeBind('#save-contact', saveContact);
        safeBind('#save-footer', saveFooter);
        safeBind('#save-seo', saveSEO);
        safeBind('#save-social', saveSocial);
        safeBind('#save-programs', savePrograms);
        safeBind('#save-athletes', saveAthletes);
        safeBind('#save-products', saveProducts);
        safeBind('#save-sponsors', saveSponsors);
        safeBind('#save-blog', saveBlog);
        safeBind('#cancel-blog-edit', resetBlogForm);

        // Dinamik yapı ekleme butonları (Gelecekte eklenirse diye hazır)
        safeBind('#add-program-btn', () => {
            const arr = getArrayData('programs', ['title', 'subtitle', 'image']);
            arr.push({ title: '', subtitle: '', image: '' });
            renderArrayCards('programs', arr, ['title', 'subtitle', 'image']);
        });
        safeBind('#add-athlete-btn', () => {
            const arr = getArrayData('athletes', ['name', 'title', 'image']);
            arr.push({ name: '', title: '', image: '' });
            renderArrayCards('athletes', arr, ['name', 'title', 'image']);
        });
        safeBind('#add-product-btn', () => {
            const arr = getArrayData('products', ['name', 'price', 'image', 'link']);
            arr.push({ name: '', price: '', image: '', link: '' });
            renderArrayCards('products', arr, ['name', 'price', 'image', 'link']);
        });
        safeBind('#add-sponsor-btn', () => {
            const arr = getArrayData('sponsors', ['name', 'logo']);
            arr.push({ name: '', logo: '' });
            renderArrayCards('sponsors', arr, ['name', 'logo']);
        });

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