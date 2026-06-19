const Blog = require('../models/Blog');
const logger = require('../utils/logger');

const slugify = (text) =>
    text.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.getPublishedPosts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Blog.find({ isPublished: true })
                .select('-content')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Blog.countDocuments({ isPublished: true })
        ]);

        res.json({ success: true, data: posts, pagination: { total, page: Number(page) } });
    } catch (err) {
        next(err);
    }
};

exports.getPostBySlug = async (req, res, next) => {
    try {
        const post = await Blog.findOneAndUpdate(
            { slug: req.params.slug, isPublished: true },
            { $inc: { viewCount: 1 } },
            { new: true }
        ).lean();

        if (!post) {
            return res.status(404).json({ success: false, message: 'Yazı bulunamadı.' });
        }

        res.json({ success: true, data: post });
    } catch (err) {
        next(err);
    }
};

exports.getAllPosts = async (req, res, next) => {
    try {
        const posts = await Blog.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: posts });
    } catch (err) {
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (!data.slug) data.slug = slugify(data.title);

        const exists = await Blog.findOne({ slug: data.slug });
        if (exists) data.slug = `${data.slug}-${Date.now()}`;

        if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();

        const post = await Blog.create(data);
        logger.info('Blog yazısı oluşturuldu', { title: post.title });

        res.status(201).json({ success: true, data: post });
    } catch (err) {
        next(err);
    }
};

exports.updatePost = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();

        const post = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Yazı bulunamadı.' });
        }

        res.json({ success: true, data: post });
    } catch (err) {
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const post = await Blog.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Yazı bulunamadı.' });
        }
        res.json({ success: true, message: 'Yazı silindi.' });
    } catch (err) {
        next(err);
    }
};
