export function notFoundHandler(req, res) {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.',
    },
  });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 503
      ? error.message || 'Service unavailable.'
      : statusCode >= 500
        ? 'Internal server error. Please try again.'
        : error.message || 'Request failed.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: {
      code: statusCode === 503 ? 'SERVICE_UNAVAILABLE' : statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message,
    },
  });
}
