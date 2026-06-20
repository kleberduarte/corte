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

  // Erros de negócio esperados — não logar como erro, são fluxos normais
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      req.log.error({ err: error, requestId: req.id }, error.message)
    }
    return reply.status(error.statusCode).send({
      error: error.code ?? 'APP_ERROR',
      message: error.message,
    })
  }

  // Erros do Fastify (ex: body parser, schema nativo)
  if ('statusCode' in error && error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      error: 'REQUEST_ERROR',
      message: error.message,
    })
  }

  // Erro inesperado — logar com contexto e não expor detalhes em produção
  req.log.error({ err: error, requestId: req.id }, 'Erro interno não tratado')
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor',
  })
}
