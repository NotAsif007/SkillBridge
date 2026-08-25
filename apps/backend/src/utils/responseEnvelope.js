/**
 * Standardized response helpers.
 * All API responses must go through these helpers.
 */

export const success = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

export const paginated = (res, data, pagination, message = 'Success') =>
  res.status(200).json({ success: true, data, pagination, message });

export const created = (res, data, message = 'Created successfully') =>
  success(res, data, message, 201);

export const noContent = (res) => res.status(204).send();

export const failure = (res, statusCode, code, message, details = []) =>
  res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
