"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
            const parsed = schema.parse(data);
            if (source === 'body')
                req.body = parsed;
            else if (source === 'query')
                req.validatedQuery = parsed;
            else
                req.validatedParams = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: messages,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map