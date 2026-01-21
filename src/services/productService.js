const Product = require('../models/Product');
const redis = require('../config/redis');
const config = require('../config');

const CACHE_PREFIX = 'product:';

async function getProductById(id) {
    const cacheKey = `${CACHE_PREFIX}${id}`;

    try {
        const cachedProduct = await redis.get(cacheKey);
        if (cachedProduct) {
            console.log(`Cache HIT for product ${id}`);
            return JSON.parse(cachedProduct);
        }
    } catch (err) {
        console.error('Redis error during GET:', err);
        // Fallback to DB
    }

    console.log(`Cache MISS for product ${id}`);
    const product = await Product.findByPk(id);

    if (product) {
        try {
            await redis.set(cacheKey, JSON.stringify(product), 'EX', config.redis.ttl);
        } catch (err) {
            console.error('Redis error during SET:', err);
        }
    }

    return product;
}

async function createProduct(data) {
    const product = await Product.create(data);
    // No need to cache on create if we don't expect immediate read, 
    // but we can if we want. Instructions say invalidate on update/delete.
    return product;
}

async function updateProduct(id, data) {
    const [updatedRowsCount, [updatedProduct]] = await Product.update(data, {
        where: { id },
        returning: true,
    });

    if (updatedRowsCount > 0) {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        try {
            await redis.del(cacheKey);
            console.log(`Cache INVALIDATED for product ${id}`);
        } catch (err) {
            console.error('Redis error during DELETE (invalidate):', err);
        }
        return updatedProduct;
    }

    return null;
}

async function deleteProduct(id) {
    const deletedRowsCount = await Product.destroy({
        where: { id },
    });

    if (deletedRowsCount > 0) {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        try {
            await redis.del(cacheKey);
            console.log(`Cache INVALIDATED for product ${id}`);
        } catch (err) {
            console.error('Redis error during DELETE (invalidate):', err);
        }
        return true;
    }

    return false;
}

module.exports = {
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
