const Content = require('../models/Content');
const { invalidateCache } = require('../middleware/cache');
const logger = require('../utils/logger');

const CMS_SECTIONS = ['milliSporcular', 'urunler', 'sponsorlar'];

// 🚨 GÜNCELLENDİ: Eğer veritabanında veri varsa, yanlış kontrolle üstüne boş default yazması engellendi.
const mergeMissingSections = (content) => {
    const defaults = new Content().toObject();
    CMS_SECTIONS.forEach((key) => {
        if (!content[key] || (content[key].items && !Array.isArray(content[key].items))) {
            content[key] = defaults[key];
        }
    });
    return content;
};

const sseClients = [];

const broadcastContentUpdate = async (content) => {
    const data = JSON.stringify(content);
    sseClients.forEach((res) => {
        try {
            res.write(`event: contentUpdated\ndata: ${data}\n\n`);
        } catch (err) {
            // ignore individual client errors
        }
    });
};

exports.contentStream = async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.write('\n');
    sseClients.push(res);

    req.on('close', () => {
        const index = sseClients.indexOf(res);
        if (index !== -1) sseClients.splice(index, 1);
    });
};

exports.getContent = async (req, res, next) => {
    try {
        let content = await Content.findOne().lean();

        if (!content) {
            const doc = new Content({});
            await doc.save();
            content = doc.toObject();
        } else {
            content = mergeMissingSections(content);
        }

        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.status(200).json({ success: true, data: content });
    } catch (err) {
        next(err);
    }
};

// 🚨 GÜNCELLENDİ: Sessizce 200 dönüp veriyi kaydetmeme kilitleri kırıldı, loglama eklendi.
exports.updateContent = async (req, res, next) => {
    try {
        let content = await Content.findOne();

        // Admin panelinden gelen body yapısını logla (Render terminalinde ne geldiğini görelim)
        logger.info('Admin panelinden gelen istek gövdesi:', { 
            gelenAlanlar: Object.keys(req.body || {}) 
        });

        if (!content) {
            content = new Content(req.body);
        } else {
            const sections = ['hero', 'ozellikler', 'hakkimizda', 'haberler', 'milliSporcular', 'programlar', 'paketler', 'urunler', 'sponsorlar', 'iletisim', 'footer', 'menu', 'sosyalMedya', 'referanslar', 'hizmetler', 'slider', 'seo', 'siteSettings', 'custom'];
            
            let guncellenenSanalAlanSayisi = 0;
            
            sections.forEach(section => {
                if (req.body[section] !== undefined) {
                    content[section] = req.body[section];
                    content.markModified(section);
                    guncellenenSanalAlanSayisi++;
                }
            });

            // Eğer hiçbir section eşleşmediyse, muhtemelen body sarmalanmadan direkt gelmiştir.
            // Bu durumda body'nin kendisini doğrudan şemaya yediriyoruz.
            if (guncellenenSanalAlanSayisi === 0) {
                logger.warn('Uyuşan section bulunamadı, body doğrudan şemaya yediriliyor.');
                Object.keys(req.body).forEach(key => {
                    content[key] = req.body[key];
                    content.markModified(key);
                });
            }
        }

        // Veritabanına fiziksel yazma işlemi
        const savedContent = await content.save();
        
        // Önbelleği temizle ve SSE ile tüm clientlara fırlat
        invalidateCache('content');
        await broadcastContentUpdate(savedContent.toObject());

        logger.info('Site içeriği veritabanına başarıyla yazıldı.', { user: req.user?.email });

        res.status(200).json({
            success: true,
            message: 'İçerik başarıyla güncellendi.',
            data: savedContent
        });
    } catch (err) {
        logger.error('updateContent içinde hata meydana geldi:', { hata: err.message });
        next(err);
    }
};

exports.updateSection = async (req, res, next) => {
    try {
        const { section } = req.params;
        let content = await Content.findOne();
        if (!content) {
            content = new Content({});
        }

        const body = req.body;
        const current = content[section];
        const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

        if (Array.isArray(body)) {
            // Bölüm bir "items" listesi içeren obje ise (programlar, paketler, milliSporcular, urunler, sponsorlar...)
            // gelen diziyi o objenin items alanına yaz; aksi halde bölümün kendisini dizi olarak ata.
            if (isPlainObject(current) && current.items !== undefined) {
                content[section].items = body;
            } else {
                content[section] = body;
            }
        } else if (isPlainObject(body)) {
            // Obje bölümlerde sadece gelen alanları güncelle (diğer alanları silmeden birleştir).
            if (isPlainObject(current)) {
                Object.keys(body).forEach((key) => {
                    content[section][key] = body[key];
                });
            } else {
                content[section] = body;
            }
        } else {
            content[section] = body;
        }

        content.markModified(section);
        const saved = await content.save();
        invalidateCache('content');
        await broadcastContentUpdate(saved.toObject());

        logger.info('Bölüm güncellendi', { section, user: req.user?.email });
        res.status(200).json({ success: true, message: `${section} güncellendi.`, data: saved[section] });
    } catch (err) {
        logger.error('updateSection içinde hata meydana geldi:', { hata: err.message });
        next(err);
    }
};