import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse()
      message = typeof res === 'string' ? res : (res as any).message ?? exception.message

      console.warn(`[HttpException] ${status} ${request.method} ${request.url}`, message)
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST
      message = `Database error: ${exception.code}`

      console.warn(`[PrismaError] ${exception.code} ${request.method} ${request.url}`)
    } else if (exception instanceof Error) {
      message = exception.message
      console.error(`[UnhandledError] ${request.method} ${request.url}`, exception)
    } else {
      console.error(`[UnknownException] ${request.method} ${request.url}`, exception)
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
