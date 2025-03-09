import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './module/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as process from 'node:process';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { registerHbsHelpers } from './util/hbs.helpers.util';

async function bootstrap() {
    const logger = new Logger('Main');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
    });

    app.useGlobalPipes(new ValidationPipe());
    logger.log(`Using global validation pipe`);

    app.enableCors({
        origin: process.env.CORS_ORIGIN === '*' ? /^.*/ : new RegExp(process.env.CORS_ORIGIN ?? ''),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    logger.log(`Using CORS origin ${process.env.CORS_ORIGIN ?? '*'}`);

    app.use(cookieParser());
    logger.log(`Using cookie parser`);

    app.setGlobalPrefix('api', { exclude: ['view(.*)'] });
    logger.log(`Using global prefix /api excluding /view/*`);

    app.useStaticAssets(join(__dirname, '..', 'template/public'));
    logger.log(`Using static assets from ${join(__dirname, '..', 'template/public')}`);

    app.setBaseViewsDir(join(__dirname, '..', 'template'));
    logger.log(`Using base views dir ${join(__dirname, '..', 'template')}`);

    app.setViewEngine('hbs');
    logger.log(`Using template engine hbs`);

    registerHbsHelpers();
    logger.log(`Registered hbs helpers`);

    if (process.env.DEV === 'true') {
        logger.verbose('Starting in DEV mode');
        const config = new DocumentBuilder().setTitle('Csengo API').setDescription('The csengo API description').setVersion('1.0').addTag('csengo').build();
        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('swagger', app, documentFactory);

        logger.debug(`Swagger started on port ${process.env.PORT ?? 3300}/swagger`);
    }

    await app.listen(process.env.PORT ?? 3300);
    logger.log(`Server started on port ${process.env.PORT ?? 3300}`);
}

bootstrap();
