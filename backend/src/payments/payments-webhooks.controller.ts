import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsWebhooksService } from './payments-webhooks.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
export class PaymentsWebhooksController {
  constructor(private readonly webhooksService: PaymentsWebhooksService) {}

  @Public()
  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mercado Pago webhook (signed notifications only)' })
  async mercadopago(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') xSignature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Missing body');
    }
    const reqAny = req as any;
    const url = `${reqAny.protocol}://${reqAny.get('host')}${reqAny.originalUrl}`;
    return this.webhooksService.handleMercadoPago(rawBody, xSignature, xRequestId, url);
  }
}