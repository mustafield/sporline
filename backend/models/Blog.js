const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    author: { type: String, default: 'Sporline Team' },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    seo: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        ogImage: { type: String, default: '' }
    },
    viewCount: { type: Number, default: 0 }
}, { timestamps: true });

BlogSchema.index({ slug: 1 });
BlogSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', BlogSchema);
