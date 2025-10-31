import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { createInterface } from 'readline';
import { PassThrough } from 'stream';
import { FileDto } from './dtos';
import { DatabaseOrderRepository } from './order.repository';
import { OrderService } from './order.service';

@ApiTags('Pedidos')
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(DatabaseOrderRepository)
    private databaseOrderRepository: DatabaseOrderRepository,
  ) {}

  @Get('orders')
  @ApiOperation({
    summary: 'Pega uma lista de usuários com seus pedidos e produtos aninhados',
    description:
      'Retorna uma lista paginada de usuários, cada um contendo seus pedidos e os produtos associados a esses pedidos. Suporta filtros por intervalo de datas e ID do pedido.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão = 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de itens por página (padrão = 10)',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Filtro de data inicial (inclusivo)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Filtro de data final (inclusivo)',
  })
  @ApiQuery({
    name: 'order_id',
    required: false,
    type: Number,
    description: 'Filtro por ID do pedido',
  })
  @ApiOkResponse({
    description: 'Lista paginada de usuários com pedidos e produtos aninhados',
  })
  async getOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('order_id') orderId?: number,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 10;

    return this.orderService.getOrdersPaginated(
      p,
      l,
      dateFrom,
      dateTo,
      orderId ? Number(orderId) : undefined,
    );
  }

  @ApiOperation({
    summary: 'Faz upload de um arquivo de pedidos em formato de largura fixa',
    description:
      'Faz upload de um arquivo onde cada linha representa um pedido em formato de largura fixa. O arquivo é processado em streaming para eficiência, e os pedidos válidos são armazenados no banco de dados enquanto o JSON resultante é retornado como resposta.',
  })
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    description: 'Envia o arquivo para ser tratado e armazenado',
    type: FileDto,
  })
  async uploadFileStream(@Req() req: Request): Promise<StreamableFile> {
    const passThrough = new PassThrough();
    const rl = createInterface({ input: req, crlfDelay: Infinity });

    passThrough.write('[');
    let first = true;

    (async () => {
      try {
        for await (const line of rl) {
          const orderParsed = this.orderService.parseFixedWidthLine(line);
          if (!orderParsed) continue;
          await this.databaseOrderRepository.insert(orderParsed);
          if (!first) passThrough.write(',');
          passThrough.write(JSON.stringify(orderParsed));
          first = false;
        }
        passThrough.write(']');
      } catch (err) {
        console.error('Streaming error:', err);
        passThrough.emit('error', err);
      } finally {
        passThrough.end();
      }
    })();

    return new StreamableFile(passThrough, {
      type: 'application/json',
      disposition: 'inline',
    });
  }
}
