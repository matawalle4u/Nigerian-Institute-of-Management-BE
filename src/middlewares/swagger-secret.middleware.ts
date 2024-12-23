import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SwaggerSecretMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const secretKey = 'Yan2Mak!';
    const providedKey = req.headers['x-secret-key'] || req.query['secret'];

    if (providedKey !== secretKey) {
      return res.status(403).send('Access denied: Invalid secret key');
    }

    next();
  }
}
