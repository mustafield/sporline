const express = require('express');
const router = express.Router();
const {
    getPublishedPosts, getPostBySlug, getAllPosts,
    createPost, updatePost, deletePost
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPublishedPosts);
router.get('/admin/all', protect, authorize('admin', 'editor'), getAllPosts);
router.get('/:slug', getPostBySlug);
router.post('/', protect, authorize('admin', 'editor'), createPost);
router.put('/:id', protect, authorize('admin', 'editor'), updatePost);
router.delete('/:id', protect, authorize('admin'), deletePost);

module.exports = router;
