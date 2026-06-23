const Content = require('../models/Content');
const { invalidateCache } = require('../middleware/cache');
const logger = require('../utils/logger');

const CMS_SECTIONS = ['milliSporcular', 'urunler', 'sponsorlar'];

const mergeMissingSections = (content) => {
    const defaults = new Content().toObject();
    CMS_SECTIONS.forEach((key) => {
        if (!content[key] || !content[key].items?.length) {
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

exports.updateContent = async (req, res, next) => {
    try {
        let content = await Content.findOne();

        if (!content) {
            content = new Content(req.body);
        } else {
            const sections = ['hero', 'ozellikler', 'hakkimizda', 'haberler', 'milliSporcular', 'programlar', 'paketler', 'urunler', 'sponsorlar', 'iletisim', 'footer', 'menu', 'sosyalMedya', 'referanslar', 'hizmetler', 'slider', 'seo', 'siteSettings', 'custom'];
            sections.forEach(section => {
                if (req.body[section] !== undefined) {
                    content[section] = req.body[section];
                    content.markModified(section);
                }
            });
        }

        await content.save();
        invalidateCache('content');
        await broadcastContentUpdate(content.toObject());

        logger.info('Site içeriği güncellendi', { user: req.user?.email });

        res.status(200).json({
            success: true,
            message: 'İçerik başarıyla güncellendi.',
            data: content
        });
    } catch (err) {
        next(err);
    }
};

exports.updateSection = async (req, res, next) => {
    try {
        const { section } = req.params;
        const content = await Content.findOne();

        if (!content) {
            return res.status(404).json({ success: false, message: 'İçerik bulunamadı.' });
        }

        content[section] = req.body;
        content.markModified(section);
        await content.save();
        invalidateCache('content');
        await broadcastContentUpdate(content.toObject());

        res.status(200).json({ success: true, message: `${section} güncellendi.`, data: content[section] });
    } catch (err) {
        next(err);
    }
};
