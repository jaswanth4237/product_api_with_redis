const { z } = require('zod');

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    stock_quantity: z.number().int().nonnegative('Stock quantity must be non-negative'),
});

const updateProductSchema = productSchema.partial();

const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.body = validatedData;
        next();
    } catch (err) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors,
        });
    }
};

module.exports = {
    validate,
    productSchema,
    updateProductSchema,
};
