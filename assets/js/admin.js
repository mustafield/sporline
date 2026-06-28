/**
 * Sporline Admin Panel v2.5 - HTML Fully Aligned Edition
 */
(function () {
    const config = window.SportlineConfig || {};
    const { API } = config;
    const API_BASE = (window.SportlineConfig && window.SportlineConfig.API_BASE) || config.API_BASE || 'https://sporline.onrender.com';
    
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
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const api = async (url, options = {}) => {
        try {
            const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
            if (res.status === 401) { 
                logout(); 
                throw new Error('Oturum süresi doldu'); 
            }
            return await res.json();
        } catch (err) {
            console.error(`API İsteği Başarısız (${url}):`, err);
            throw err;
        }
    };

    const toast = (msg, type = 'success') => {
        const t = $('#toast-box');
        if (!t) return;
        t.textContent = msg;
        t.className = `fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xl transition-all duration-300 ${
            type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`;
        requestAnimationFrame(() => {
            t.style.transform = 'translateY(0)';
            t.style.opacity = '1';
        });
        setTimeout(() => {
            t.style.transform = 'translateY(20px)';
            t.style.opacity = '0';
        }, 3500);
    };

    const showLogin = (visible) => {
        if (visible) {
            $('#login-screen')?.classList.remove('hidden');
            $('#admin-sidebar')?.classList.add('-translate-x-full');
        } else {
            $('#login-screen')?.classList.add('hidden');
            $('#admin-sidebar')?.classList.remove('-translate-x-full');
        }
    };

    const checkAuth = async () => {
        if (!token) return showLogin(true);
        try {
            const res = await api(`${API_BASE}/api/auth/me`); 
            const meUser = (res && res.data && res.data.user) || (res && res.user);
            if (meUser) {
                currentUser = meUser;
                if ($('#user-name')) $('#user-name').textContent = currentUser.name || 'Yönetici';
                if ($('#user-avatar')) $('#user-avatar').textContent = (currentUser.name || 'Y').charAt(0);
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
        if (!btn) return;
        
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Giriş Yapılıyor...';

        const email = $('#login-email')?.value.trim() || '';
        const password = $('#login-password')?.value || '';

        try {
            const loginUrl = `${API_BASE}/api/auth/login`;
            const res = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();

            // Backend hangi key ile token gonderiyor - konsola yaz (debug)
            console.log('Login API yaniti:', JSON.stringify(data));

            // token, accessToken, jwt, access_token farkli key isimlerini destekle
            const receivedToken = (data.data && data.data.token) || data.token || data.accessToken || data.access_token || data.jwt;

            if (res.ok && receivedToken) {
                localStorage.setItem('sporline_token', receivedToken);
                token = receivedToken;
                toast('Giriş başarılı, panel yükleniyor...');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const errMsg = data.message || data.error || data.msg || ('Sunucu yaniti: ' + JSON.stringify(data));
                toast(errMsg + ' (HTTP: ' + res.status + ')', 'error');
            }
        } catch (err) {
            toast('Sunucuyla bağlantı kurulamadı!', 'error');
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
            switchPanel('leads');
        } catch (err) {
            toast('Veriler yüklenirken hata oluştu', 'error');
        }
    };

    const switchPanel = (panelId) => {
        $$('.admin-panel').forEach(p => p.classList.add('hidden'));
        $$('.sidebar-link').forEach(l => l.classList.remove('active'));
        
        $(`#panel-${panelId}`)?.classList.remove('hidden');
        $(`[data-panel="${panelId}"]`)?.classList.add('active');
    };

    const loadLeads = async () => {
        try {
            const data = await api(`${API_BASE}/api/contacts`);
            const tbody = $('#leads-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-neutral-500">Henüz talep bulunmuyor.</td></tr>`;
                return;
            }

            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(lead => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-neutral-900/20 hover:bg-white/[0.01] transition';
                tr.innerHTML = `
                    <td class="p-4 font-medium text-white">${esc(lead.name)}</td>
                    <td class="p-4 text-neutral-400">${esc(lead.phone)}<br><span class="opacity-60">${esc(lead.email || '')}</span></td>
                    <td class="p-4 text-neutral-400">${esc(lead.program || 'Genel İletişim')}</td>
                    <td class="p-4 text-neutral-400 max-w-xs truncate" title="${esc(lead.message)}">${esc(lead.message || '-')}</td>
                    <td class="p-4 text-neutral-500">${new Date(lead.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td class="p-4 text-right">
                        <select onchange="Admin.updateLead('${lead._id}', this.value)" class="bg-brandDark border border-neutral-900 rounded-lg px-2 py-1 text-[11px] font-medium text-neutral-300 focus:outline-none focus:border-brandGold transition">
                            <option value="Beklemede" ${lead.status === 'Beklemede' ? 'selected' : ''}>Beklemede</option>
                            <option value="Arandı" ${lead.status === 'Arandı' ? 'selected' : ''}>Arandı</option>
                            <option value="İptal" ${lead.status === 'İptal' ? 'selected' : ''}>İptal</option>
                        </select>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Talepler yüklenemedi:', err);
        }
    };

    const updateLead = async (id, status) => {
        try {
            await api(`${API_BASE}/api/contacts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            toast('Talep durumu güncellendi');
        } catch {
            toast('Durum güncellenirken hata oluştu', 'error');
        }
    };

    const loadContent = async () => {
        try {
            contentData = await api(`${API_BASE}/api/content`);
            fillForms();
        } catch (err) {
            console.error("İçerik yüklenemedi:", err);
        }
    };

    const fillForms = () => {
        if (!contentData) return;

        // Hero Bölümü (HTML ID'lerine tam uyumlu)
        if (contentData.hero) {
            if($('#hero-tagline')) $('#hero-tagline').value = contentData.hero.tagline || '';
            if($('#hero-video')) $('#hero-video').value = contentData.hero.videoUrl || '';
            if($('#hero-title1')) $('#hero-title1').value = contentData.hero.titleLine1 || '';
            if($('#hero-title2')) $('#hero-title2').value = contentData.hero.titleLine2 || '';
            if($('#hero-desc')) $('#hero-desc').value = contentData.hero.description || '';
            if($('#hero-cta1')) $('#hero-cta1').value = contentData.hero.ctaPrimary || '';
            if($('#hero-cta2')) $('#hero-cta2').value = contentData.hero.ctaSecondary || '';
        }

        // Hakkımızda Bölümü (main.js ile uyumlu: hakkimizda anahtarı)
        if (contentData.hakkimizda) {
            if($('#about-label')) $('#about-label').value = contentData.hakkimizda.sectionLabel || '';
            if($('#about-title')) $('#about-title').value = contentData.hakkimizda.title || '';
            if($('#about-subtitle')) $('#about-subtitle').value = contentData.hakkimizda.subtitle || '';
            if($('#about-text1')) $('#about-text1').value = contentData.hakkimizda.text1 || '';
            if($('#about-text2')) $('#about-text2').value = contentData.hakkimizda.text2 || '';
            if($('#about-image')) $('#about-image').value = contentData.hakkimizda.imageUrl || '';
        }

        // Fon Müzikleri (Sıralı Oynatma 3 Adet)
        if (contentData.musics && Array.isArray(contentData.musics)) {
            for (let i = 0; i < 3; i++) {
                if($(`#music-url-${i}`)) $(`#music-url-${i}`).value = contentData.musics[i] || '';
            }
        }

        // Haber Bandı
        if (contentData.news) {
            if($('#news-text')) $('#news-text').value = Array.isArray(contentData.news.text) ? contentData.news.text.join('\n') : (contentData.news.text || '');
        }

        // İletişim Bilgileri (main.js ile uyumlu: iletisim anahtarı)
        if (contentData.iletisim) {
            if($('#contact-phone')) $('#contact-phone').value = contentData.iletisim.telefon || '';
            if($('#contact-email')) $('#contact-email').value = contentData.iletisim.email || '';
            if($('#contact-address')) $('#contact-address').value = contentData.iletisim.adres || '';
            if($('#contact-mapsrc')) $('#contact-mapsrc').value = contentData.iletisim.mapsSrc || '';
            if($('#contact-hours')) $('#contact-hours').value = contentData.iletisim.saatler || '';
        }

        // Sosyal Medya
        if (contentData.social) {
            if($('#social-instagram')) $('#social-instagram').value = contentData.social.instagram || '';
            if($('#social-whatsapp')) $('#social-whatsapp').value = contentData.social.whatsapp || '';
            if($('#social-facebook')) $('#social-facebook').value = contentData.social.facebook || '';
            if($('#social-youtube')) $('#social-youtube').value = contentData.social.youtube || '';
        }

        // Footer Alt Bilgileri (main.js ile uyumlu: tagline, copyright)
        if (contentData.footer) {
            if($('#footer-copy')) $('#footer-copy').value = contentData.footer.copyright || '';
            if($('#footer-about')) $('#footer-about').value = contentData.footer.tagline || '';
        }

        // SEO Ayarları
        if (contentData.seo) {
            if($('#seo-title')) $('#seo-title').value = contentData.seo.title || '';
            if($('#seo-desc')) $('#seo-desc').value = contentData.seo.description || '';
            if($('#seo-keywords')) $('#seo-keywords').value = contentData.seo.keywords || '';
        }

        renderDynamicCards('programs', contentData.programs || [], ['title', 'subtitle', 'image']);
        renderDynamicCards('prices', contentData.prices || [], ['title', 'amount', 'period', 'features']);
        renderDynamicCards('athletes', contentData.athletes || [], ['name', 'title', 'image']);
        renderDynamicCards('products', contentData.products || [], ['name', 'price', 'image', 'link']);
        renderDynamicCards('sponsors', contentData.sponsors || [], ['name', 'logo']);
        renderBlogList(contentData.blogs || []);
    };

    const renderDynamicCards = (type, array, fields) => {
        const container = $(`#${type}-container`);
        if (!container) return;
        container.innerHTML = '';

        array.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'bg-brandDark border border-neutral-900 rounded-xl p-5 relative group hover:border-brandGold/20 transition space-y-3';
            
            let innerHTML = `
                <button type="button" onclick="this.closest('.group').remove()" class="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 flex items-center justify-center transition opacity-0 group-hover:opacity-100 z-10">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            `;

            fields.forEach(f => {
                const val = item[f] || '';
                if (f === 'image' || f === 'logo') {
                    innerHTML += `
                        <div>
                            <label class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Görsel / Logo URL</label>
                            <input type="text" data-field="${f}" value="${val}" class="form-input">
                        </div>
                    `;
                } else if (f === 'features') {
                    innerHTML += `
                        <div>
                            <label class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Özellikler (Satır Satır)</label>
                            <textarea data-field="${f}" class="form-input h-20 resize-none">${Array.isArray(val) ? val.join('\n') : val}</textarea>
                        </div>
                    `;
                } else {
                    innerHTML += `
                        <div>
                            <label class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">${f}</label>
                            <input type="text" data-field="${f}" value="${val}" class="form-input">
                        </div>
                    `;
                }
            });

            card.innerHTML = innerHTML;
            container.appendChild(card);
        });
    };

    const getDynamicCardData = (type, fields) => {
        const container = $(`#${type}-container`);
        if (!container) return [];
        const result = [];
        container.querySelectorAll('.group').forEach(card => {
            const obj = {};
            fields.forEach(f => {
                const el = card.querySelector(`[data-field="${f}"]`);
                if (!el) return;
                if (f === 'features') {
                    obj[f] = el.value.split('\n').map(x => x.trim()).filter(Boolean);
                } else {
                    obj[f] = el.value.trim();
                }
            });
            result.push(obj);
        });
        return result;
    };

    const handleFileUpload = async (fileInputId, textInputId) => {
        const fileInput = $(fileInputId);
        if (!fileInput || !fileInput.files[0]) return;
        
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        try {
            toast('Dosya yükleniyor...');
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                if($(textInputId)) $(textInputId).value = data.url;
                toast('Dosya başarıyla yüklendi');
            } else {
                toast(data.message || 'Yükleme başarısız', 'error');
            }
        } catch {
            toast('Yükleme esnasında sunucu hatası oluştu', 'error');
        }
    };

    const saveSection = async (section, data) => {
        try {
            await api(`${API_BASE}/api/content/${section}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            toast('Değişiklikler başarıyla kaydedildi');
        } catch {
            toast('Kaydedilirken hata oluştu', 'error');
        }
    };

    const renderBlogList = (blogs) => {
        const tbody = $('#blogs-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!blogs || blogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-neutral-500">Henüz blog yazısı eklenmemiş.</td></tr>';
            return;
        }

        blogs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(b => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-neutral-900/40 hover:bg-white/[0.01] transition';
            tr.innerHTML = `
                <td class="p-3"><img src="${b.image || ''}" class="w-10 h-10 rounded-lg object-cover bg-neutral-900"></td>
                <td class="p-3 font-medium text-white truncate max-w-xs">${esc(b.title)}</td>
                <td class="p-3 text-neutral-400">${esc(b.category || 'Genel')}</td>
                <td class="p-3 text-neutral-500">${new Date(b.createdAt).toLocaleDateString('tr-TR')}</td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                    <button type="button" onclick="Admin.editBlog('${b._id}')" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-brandGold hover:text-brandDark transition text-[11px] font-semibold">Düzenle</button>
                    <button type="button" onclick="Admin.deleteBlog('${b._id}')" class="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-[11px] font-semibold">Sil</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    const saveBlog = async () => {
        const id = $('#blog-id')?.value;
        const title = $('#blog-title')?.value.trim() || '';
        const category = $('#blog-category')?.value.trim() || '';
        const image = $('#blog-image')?.value.trim() || '';
        const readTime = $('#blog-readtime')?.value.trim() || '';
        const summary = $('#blog-summary')?.value.trim() || '';
        const content = $('#blog-content')?.value.trim() || '';

        if (!title || !content) return toast('Başlık ve içerik zorunludur', 'error');
        const payload = { title, category, image, readTime, summary, content };

        try {
            if (id) {
                await api(`${API_BASE}/api/blogs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                toast('Blog yazısı güncellendi');
            } else {
                await api(`${API_BASE}/api/blogs`, { method: 'POST', body: JSON.stringify(payload) });
                toast('Yeni blog yazısı eklendi');
            }
            resetBlogForm();
            loadContent();
        } catch {
            toast('Blog kaydedilemedi', 'error');
        }
    };

    const editBlog = (id) => {
        const b = (contentData.blogs || []).find(x => x._id === id);
        if (!b) return;
        if($('#blog-id')) $('#blog-id').value = b._id;
        if($('#blog-title')) $('#blog-title').value = b.title || '';
        if($('#blog-category')) $('#blog-category').value = b.category || '';
        if($('#blog-image')) $('#blog-image').value = b.image || '';
        if($('#blog-readtime')) $('#blog-readtime').value = b.readTime || '';
        if($('#blog-summary')) $('#blog-summary').value = b.summary || '';
        if($('#blog-content')) $('#blog-content').value = b.content || '';
        if($('#blog-form-title')) $('#blog-form-title').textContent = 'Blog Yazısını Düzenle';
        $('#cancel-blog-edit')?.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteBlog = async (id) => {
        if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
        try {
            await api(`${API_BASE}/api/blogs/${id}`, { method: 'DELETE' });
            toast('Yazı silindi');
            loadContent();
        } catch {
            toast('Silme işlemi başarısız', 'error');
        }
    };

    const resetBlogForm = () => {
        if($('#blog-id')) $('#blog-id').value = '';
        if($('#blog-title')) $('#blog-title').value = '';
        if($('#blog-category')) $('#blog-category').value = '';
        if($('#blog-image')) $('#blog-image').value = '';
        if($('#blog-readtime')) $('#blog-readtime').value = '';
        if($('#blog-summary')) $('#blog-summary').value = '';
        if($('#blog-content')) $('#blog-content').value = '';
        if($('#blog-form-title')) $('#blog-form-title').textContent = 'Yeni Blog Yazısı Ekle';
        $('#cancel-blog-edit')?.classList.add('hidden');
    };

    document.addEventListener('DOMContentLoaded', () => {
        $('#login-form')?.addEventListener('submit', login);
        $('#logout-btn')?.addEventListener('click', logout);

        $$('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchPanel(link.dataset.panel);
            });
        });

        // Dosya yükleme dinleyicileri (HTML elementlerine bağlandı)
        $('#hero-video-file')?.addEventListener('change', () => handleFileUpload('#hero-video-file', '#hero-video'));
        $('#about-image-file')?.addEventListener('change', () => handleFileUpload('#about-image-file', '#about-image'));
        $('#blog-image-file')?.addEventListener('change', () => handleFileUpload('#blog-image-file', '#blog-image'));

        // Bölüm Kayıt Tetikleyicileri
        $('#save-hero')?.addEventListener('click', () => saveSection('hero', { tagline: $('#hero-tagline').value, videoUrl: $('#hero-video').value, titleLine1: $('#hero-title1').value, titleLine2: $('#hero-title2').value, description: $('#hero-desc').value, ctaPrimary: $('#hero-cta1').value, ctaSecondary: $('#hero-cta2').value }));
        $('#save-about')?.addEventListener('click', () => saveSection('hakkimizda', { sectionLabel: $('#about-label').value, title: $('#about-title').value, subtitle: $('#about-subtitle').value, text1: $('#about-text1').value, text2: $('#about-text2').value, imageUrl: $('#about-image').value }));
        $('#save-news')?.addEventListener('click', () => saveSection('news', { text: $('#news-text').value.split('\n').filter(Boolean) }));
        $('#save-contact')?.addEventListener('click', () => saveSection('iletisim', { telefon: $('#contact-phone').value, email: $('#contact-email').value, adres: $('#contact-address').value, mapsSrc: $('#contact-mapsrc').value, saatler: $('#contact-hours').value }));
        $('#save-social')?.addEventListener('click', () => saveSection('social', { instagram: $('#social-instagram').value, whatsapp: $('#social-whatsapp').value, facebook: $('#social-facebook').value, youtube: $('#social-youtube').value }));
        $('#save-footer')?.addEventListener('click', () => saveSection('footer', { copyright: $('#footer-copy').value, tagline: $('#footer-about').value }));
        $('#save-seo')?.addEventListener('click', () => saveSection('seo', { title: $('#seo-title').value, keywords: $('#seo-keywords').value, description: $('#seo-desc').value }));
        
        $('#save-musics')?.addEventListener('click', () => {
            const arr = [$('#music-url-0').value, $('#music-url-1').value, $('#music-url-2').value].filter(Boolean);
            saveSection('musics', arr);
        });

        // Dinamik Listelerin Kayıt Butonları
        $('#save-programs')?.addEventListener('click', () => saveSection('programs', getDynamicCardData('programs', ['title', 'subtitle', 'image'])));
        $('#save-prices')?.addEventListener('click', () => saveSection('prices', getDynamicCardData('prices', ['title', 'amount', 'period', 'features'])));
        $('#save-athletes')?.addEventListener('click', () => saveSection('athletes', getDynamicCardData('athletes', ['name', 'title', 'image'])));
        $('#save-products')?.addEventListener('click', () => saveSection('products', getDynamicCardData('products', ['name', 'price', 'image', 'link'])));
        $('#save-sponsors')?.addEventListener('click', () => saveSection('sponsors', getDynamicCardData('sponsors', ['name', 'logo'])));
        
        $('#save-blog')?.addEventListener('click', saveBlog);
        $('#cancel-blog-edit')?.addEventListener('click', resetBlogForm);

        checkAuth();
    });

    window.Admin = { updateLead, editBlog, deleteBlog };
})();