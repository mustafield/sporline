const express = require('express');
const router = express.Router();
const { getSitemap, getRobots, getSchema } = require('../controllers/seoController');

router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobots);
router.get('/schema', getSchema);

module.exports = router;
