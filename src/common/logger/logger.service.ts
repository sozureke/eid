import { Injectable, LoggerService as NestLogger } from '@nestjs/common'
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

@Injectable()
export class LoggerService implements NestLogger {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`
      })
    ),
    transports: [
      // Console transport for development
      new transports.Console(),

      // General application logs
      new DailyRotateFile({
        dirname: 'logs/app',
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '14d',
        level: 'info',
      }),

      // Errors 
      new DailyRotateFile({
        dirname: 'logs/errors',
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '30d',
        level: 'error',
      }),

      // HTTP requests
      new DailyRotateFile({
        dirname: 'logs/http',
        filename: 'http-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '7d',
        level: 'http',
      }),
    ],
  })

  log(message: string) {
    this.logger.info(message)
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message}${trace ? `\nTrace: ${trace}` : ''}`)
  }

  warn(message: string) {
    this.logger.warn(message)
  }

  debug(message: string) {
    this.logger.debug(message)
  }

  verbose(message: string) {
    this.logger.verbose(message)
  }

  http(message: string) {
    this.logger.http?.(message)
  }
}
