import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const requestLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      queryParams: req.query,
      pathParams: req.params,
      body: req.body,
    };

    console.log(JSON.stringify({ request: requestLog }, null, 2));

    const startTime = Date.now();
    return next.handle().pipe(
      tap((responseData) => {
        const responseLog = {
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode,
          duration: `${Date.now() - startTime}ms`,
          responseData, // Logs the actual response
        };

        console.log(JSON.stringify({ response: responseLog }, null, 2));
      }),
    );
  }
}
