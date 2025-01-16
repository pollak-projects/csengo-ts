import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Catch(BadRequestException)
export class DeleteFileOnErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger(DeleteFileOnErrorFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        this.logger.verbose(`Deleting currently uploaded file, because it failed to validate: ${JSON.stringify(request.file)}`);

        fs.unlink(request.file!.path, (err) => {
            if (err) {
                this.logger.error(`Error deleting file: `, err);
                return err;
            }
        });

        response.status(status).json(exception.getResponse());
    }
}
