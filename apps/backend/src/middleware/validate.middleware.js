import { failure } from '../utils/responseEnvelope.js';

/**
 * Zod validation middleware factory.
 * Usage: validate(MyZodSchema)
 * Validates req.body by default; optionally validate query or params.
 *
 * Example:
 *   router.post('/profile', validate(profileSchema), profileController.update);
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      return failure(res, 422, 'VALIDATION_ERROR', 'Invalid request data', details);
    }

    // Replace input with parsed & coerced data
    req[source] = result.data;
    next();
  };
}
