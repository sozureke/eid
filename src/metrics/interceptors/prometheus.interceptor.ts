import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common'
import * as client from 'prom-client'
import { Observable, tap } from 'rxjs'

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 400, 500, 1000, 2000],
})

client.collectDefaultMetrics()

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const ctx = context.switchToHttp()
    const request = ctx.getRequest()
    const response = ctx.getResponse()

    return next.handle().pipe(
      tap(() => {
        const route = request.route?.path || request.url
        const method = request.method
        const statusCode = response.statusCode

        httpRequestDurationMicroseconds
          .labels(method, route, String(statusCode))
          .observe(Date.now() - now)
      })
    )
  }
}
