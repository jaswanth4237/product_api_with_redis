# Product Catalog API with Redis Caching

A high-performance backend API service for managing a product catalog, featuring robust Redis caching strategies and PostgreSQL persistence.

## Features

- **RESTful API**: Full CRUD operations for products.
- **Cache-Aside Caching**: Optimized read performance using Redis.
- **Cache Invalidation**: Automatic cache eviction on updates and deletions to ensure data consistency.
- **Input Validation**: Robust request payload validation using Zod.
- **Dockerized**: Easy deployment using Docker and Docker Compose.
- **Health Checks**: Integrated health monitoring for all services.
- **Automated Tests**: Comprehensive integration tests for API and caching logic.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Sequelize ORM)
- **Cache**: Redis (via ioredis)
- **Validation**: Zod
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Setup and Running

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd product_api_with_redis
   ```

2. **Configure environment variables**:
   Modify the `.env.example` if needed, but the default values in `docker-compose.yml` should work out of the box.

3. **Start the application**:
   ```bash
   docker-compose up --build
   ```
   The API will be available at `http://localhost:8080`.

### Running Tests

To run the automated test suite within the Docker environment:

```bash
docker-compose exec api-service npm test
```

## API Documentation

### 1. Create a Product
- **Method**: `POST`
- **Path**: `/products`
- **Body**:
  ```json
  {
    "name": "Mechanical Keyboard",
    "description": "RGB backlit mechanical keyboard",
    "price": 89.99,
    "stock_quantity": 45
  }
  ```
- **Response**: `201 Created`

### 2. Get Product by ID
- **Method**: `GET`
- **Path**: `/products/{id}`
- **Response**: `200 OK` (with JSON) or `404 Not Found`

### 3. Update Product by ID
- **Method**: `PUT`
- **Path**: `/products/{id}`
- **Body**: Partial updates allowed.
- **Response**: `200 OK`

### 4. Delete Product by ID
- **Method**: `DELETE`
- **Path**: `/products/{id}`
- **Response**: `204 No Content`

## Caching Strategy

The system uses a **Cache-Aside** (Lazy Loading) pattern:

- **Read Operations**:
  1. Check Redis for the product ID.
  2. If found (**Cache Hit**), return the data immediately.
  3. If not found (**Cache Miss**), fetch from PostgreSQL, store in Redis with a TTL, and return.
- **Write Operations**:
  1. Update/Delete the record in PostgreSQL.
  2. On success, **Invalidate** (delete) the corresponding Redis key.
  3. Subsequent reads will force a refresh from the database.

## Design Decisions

- **Multi-stage Docker Build**: Minimizes the final image size by separating build dependencies from runtime logic.
- **Graceful Degradation**: If Redis is unavailable, the application logs the error and falls back to fetching directly from the database, ensuring service availability.
- **Zod for Validation**: Provides type-safe and declarative validation logic.
- **Sequelize for DB**: Simplifies database interactions and handle migrations/syncing efficiently.