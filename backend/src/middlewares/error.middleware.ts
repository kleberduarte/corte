import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../errors/AppError'

export function errorHandler(error: FastifyError | Error, req: FastifyRequest, reply: FastifyReply) {
  // Erros de validação Zod
  if (error instanceof ZodError) {
    return reply.status(422).send({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: error.flatten().fieldErrors,
    })
  }

  // Erros de negócio esperados
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code ?? 'APP_ERROR',
      message: error.message,
    })
  }

  // Erros do Fastify (ex: schema validation nativa)
  if ('statusCode' in error && error.statusCode) {
    return reply.status(error.statusCode).send({
      error: 'REQUEST_ERROR',
      message: error.message,
    })
  }

  // Erro inesperado — não expor detalhes em produção
  console.error('[UNHANDLED ERROR]', error)
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor',
  })
}
