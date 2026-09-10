import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

const PLACEHOLDER_PATTERNS = [
  "change-me",
  "troque-",
  "your-super-secret",
  "em-producao",
  "em produção",
];

function assertProductionEnv(configService: ConfigService) {
  const isProd = configService.get<string>("NODE_ENV") === "production";
  if (!isProd) return;

  if (configService.get<string>("ALLOW_INSECURE_ENV") === "true") return;

  const secrets = {
    JWT_SECRET: configService.get<string>("JWT_SECRET") || "",
    JWT_REFRESH_SECRET: configService.get<string>("JWT_REFRESH_SECRET") || "",
  };

  const weak = Object.entries(secrets).filter(([, value]) => {
    const lower = value.toLowerCase();
    return (
      value.length < 32 ||
      PLACEHOLDER_PATTERNS.some((pattern) => lower.includes(pattern))
    );
  });

  if (weak.length > 0) {
    throw new Error(
      `Configuração insegura em produção: ${weak
        .map(([key]) => key)
        .join(", ")} não pode usar segredos placeholder. ` +
        `Gere segredos fortes (ex.: openssl rand -base64 48) e defina "troque-" no lugar.`,
    );
  }

  const databaseUrl = configService.get<string>("DATABASE_URL") || "";
  if (databaseUrl.includes("agrobusca123") || databaseUrl.includes(":123123123@")) {
    throw new Error(
      "Configuração insegura em produção: DATABASE_URL usa senha padrão/já conhecida. " +
        "Defina uma senha forte no banco e no .env.",
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger('AgroBuscaFacil'),
    bufferLogs: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  assertProductionEnv(configService);
  const port = configService.get<number>('PORT') || 4000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const apiVersion = configService.get<string>('API_VERSION') || 'v1';

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`, { exclude: ['/'] });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  const corsOrigins = (configService.get<string>('CORS_ORIGIN') || 'https://agrobuscafacil-one.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isProd = configService.get<string>('NODE_ENV') === 'production';

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Idempotency-Key',
    ],
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        return new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: result,
        });
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  if (configService.get<boolean>('SWAGGER_ENABLED') && configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(
        configService.get<string>('SWAGGER_TITLE') || 'AgroBuscaFácil API',
      )
      .setDescription(
        configService.get<string>('SWAGGER_DESCRIPTION') ||
          'API do Marketplace AgroBuscaFácil v2',
      )
      .setVersion('2.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Autenticação e autorização')
      .addTag('Users', 'Gerenciamento de usuários')
      .addTag('Suppliers', 'Gerenciamento de fornecedores')
      .addTag('Products', 'Gerenciamento de produtos')
      .addTag('Services', 'Gerenciamento de serviços')
      .addTag('Orders', 'Gerenciamento de pedidos')
      .addTag('Cart', 'Gerenciamento de carrinho')
      .addTag('Checkout', 'Processo de checkout')
      .addTag('Categories', 'Gerenciamento de categorias')
      .addTag('Search', 'Busca avançada')
      .addTag('Chat', 'Mensagens e chat')
      .addTag('Reviews', 'Avaliações')
      .addTag('Payments', 'Pagamentos')
      .addTag('Shipping', 'Frete e entregas')
      .addTag('Dashboard', 'Dashboard do fornecedor')
      .addTag('Admin', 'Administração do sistema')
      .addTag('Notifications', 'Notificações')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  await app.listen(port, () => {
    logger.log(`Server running on http://localhost:${port}`);
    logger.log(
      `Swagger docs available at http://localhost:${port}/docs`,
    );
    logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  });
}

bootstrap();
