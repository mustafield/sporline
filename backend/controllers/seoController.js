const Content = require('../models/Content');
const Blog = require('../models/Blog');

exports.getSitemap = async (req, res, next) => {
    try {
        const baseUrl = process.env.SITE_URL || 'https://www.sporlinefitness.com.tr';
        const content = await Content.findOne().lean();
        const posts = await Blog.find({ isPublished: true }).select('slug updatedAt').lean();

        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'weekly' },
            { loc: '/kvkk.html', priority: '0.3', changefreq: 'yearly' },
            { loc: '/gizlilik.html', priority: '0.3', changefreq: 'yearly' },
            { loc: '/kullanim-kosullari.html', priority: '0.3', changefreq: 'yearly' }
        ];

        const blogPages = posts.map(p => ({
            loc: `/blog/${p.slug}`,
            lastmod: p.updatedAt?.toISOString().split('T')[0],
            priority: '0.7',
            changefreq: 'monthly'
        }));

        const allPages = [...staticPages, ...blogPages];
        const lastmod = content?.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${p.lastmod || lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        next(err);
    }
};

exports.getRobots = (req, res) => {
    const baseUrl = process.env.SITE_URL || 'https://www.sporlinefitness.com.tr';
    const robots = `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
};

exports.getSchema = async (req, res, next) => {
    try {
        const content = await Content.findOne().lean();
        if (!content) {
            return res.status(404).json({ success: false, message: 'İçerik bulunamadı.' });
        }

        const schema = {
            '@context': 'https://schema.org',
            '@type': content.seo?.schemaType || 'ExerciseGym',
            name: content.siteSettings?.siteName || 'SPORLINE FITNESS',
            image: content.seo?.ogImage,
            url: content.seo?.canonical,
            telephone: content.iletisim?.telefonRaw,
            priceRange: '$$$',
            address: {
                '@type': 'PostalAddress',
                streetAddress: content.iletisim?.adres,
                addressLocality: 'Kayseri',
                addressCountry: 'TR'
            },
            openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '08:30',
                closes: '23:00'
            }],
            sameAs: (content.sosyalMedya || []).filter(s => s.isActive).map(s => s.url)
        };

        res.json({ success: true, data: schema });
    } catch (err) {
        next(err);
    }
};
