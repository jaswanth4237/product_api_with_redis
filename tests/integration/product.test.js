const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/db');
const redis = require('../../src/config/redis');
const Product = require('../../src/models/Product');

describe('Product API with Caching', () => {
    let productId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await redis.flushall();
    });

    afterAll(async () => {
        await sequelize.close();
        await redis.quit();
    });

    it('should create a new product', async () => {
        const res = await request(app)
            .post('/products')
            .send({
                name: 'Test Product',
                description: 'Test Description',
                price: 10.99,
                stock_quantity: 100
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Test Product');
        productId = res.body.id;
    });

    it('should get product and cache it (cache miss then hit)', async () => {
        // First GET - Cache Miss
        const res1 = await request(app).get(`/products/${productId}`);
        expect(res1.statusCode).toEqual(200);

        // Verify it is in Redis
        const cachedData = await redis.get(`product:${productId}`);
        expect(cachedData).not.toBeNull();
        const parsedCache = JSON.parse(cachedData);
        expect(parsedCache.id).toEqual(productId);

        // Second GET - Cache Hit
        const res2 = await request(app).get(`/products/${productId}`);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.id).toEqual(productId);
    });

    it('should invalidate cache on update', async () => {
        // Ensure it is cached
        await request(app).get(`/products/${productId}`);
        expect(await redis.get(`product:${productId}`)).not.toBeNull();

        // Update
        const res = await request(app)
            .put(`/products/${productId}`)
            .send({ price: 15.99 });

        expect(res.statusCode).toEqual(200);
        expect(Number(res.body.price)).toEqual(15.99);

        // Verify cache is gone
        const cachedData = await redis.get(`product:${productId}`);
        expect(cachedData).toBeNull();
    });

    it('should invalidate cache on delete', async () => {
        // Ensure it is cached
        await request(app).get(`/products/${productId}`);
        expect(await redis.get(`product:${productId}`)).not.toBeNull();

        // Delete
        const res = await request(app).delete(`/products/${productId}`);
        expect(res.statusCode).toEqual(204);

        // Verify cache is gone
        const cachedData = await redis.get(`product:${productId}`);
        expect(cachedData).toBeNull();

        // Verify 404 on subsequent GET
        const res2 = await request(app).get(`/products/${productId}`);
        expect(res2.statusCode).toEqual(404);
    });
});
