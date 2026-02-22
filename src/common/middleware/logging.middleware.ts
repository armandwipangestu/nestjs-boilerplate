import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express"
import { CustomLoggerService } from "../logger/logger.service";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    constructor(private logger: CustomLoggerService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;

            const logData = {
                method,
                url: originalUrl,
                statusCode,
                duration: `${duration}ms`,
                ip,
                userAgent: req.get('user-agent'),
            };

            if (statusCode >= 500) {
                this.logger.error(`HTTP Request`, JSON.stringify(logData), 'HTTP');
            } else if (statusCode >= 400) {
                this.logger.warn(`HTTP Request`, JSON.stringify(logData), 'HTTP');
            } else {
                this.logger.log(`HTTP Request`, JSON.stringify(logData), 'HTTP');
            }
        });

        next();
    }
}