require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  },
  db: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/productdb',
  },
};
