import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpActiveRequestsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.metricsService.httpActiveRequests.add(1);

    return next.handle().pipe(
      finalize(() => {
        this.metricsService.httpActiveRequests.add(-1);
      }),
    );
  }
}
