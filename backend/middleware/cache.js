const cache = new Map();
const DEFAULT_TTL = 60 * 1000;

const getCache = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.data;
};

const setCache = (key, data, ttl = DEFAULT_TTL) => {
    cache.set(key, { data, expiry: Date.now() + ttl });
};

const invalidateCache = (pattern) => {
    if (!pattern) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
    }
};

const cacheMiddleware = (key, ttl = DEFAULT_TTL) => (req, res, next) => {
    const cacheKey = `${key}:${req.originalUrl}`;
    const cached = getCache(cacheKey);
    if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode < 400) setCache(cacheKey, body, ttl);
        res.set('X-Cache', 'MISS');
        return originalJson(body);
    };
    next();
};

module.exports = { getCache, setCache, invalidateCache, cacheMiddleware };
