import type { FastifyInstance, FastifyError } from 'fastify';

export async function registerErrorHandler(app: FastifyInstance): Promise<void> {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode || 500;

    // Don't leak internal errors in production
    const message =
      statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;

    return reply.status(statusCode).send({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message,
      },
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });
}
