import { Injectable } from '@nestjs/common';
import { OrderDto } from './dtos';
import { OrderM } from './order.model';
import { DatabaseOrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  constructor(private orderRepository: DatabaseOrderRepository) {}

  public parseFixedWidthLine(line: string): OrderDto | null {
    if (!line || line.length < 95) return null;

    try {
      const order: OrderDto = {
        internalId: 0,
        idUsuario: Number(line.slice(0, 10).replace(/^0+/, '')),
        nome: line.slice(10, 55).trim(),
        idPedido: Number(line.slice(55, 65).replace(/^0+/, '')),
        idProduto: Number(line.slice(65, 75).replace(/^0+/, '')),
        valorProduto: parseFloat(line.slice(75, 87).trim()),
        dataCompra: new Date(
          `${line.slice(87, 91)}-${line.slice(91, 93)}-${line.slice(93, 95)}`,
        ),
      };
      return order;
    } catch {
      return null;
    }
  }

  public getOrdersPaginated(
    page: number,
    limit: number,
    dateFrom?: string,
    dateTo?: string,
    orderId?: number,
  ): Promise<OrderM[]> {
    return this.orderRepository.getOrdersPaginated(
      page,
      limit,
      dateFrom,
      dateTo,
      orderId,
    );
  }
}
