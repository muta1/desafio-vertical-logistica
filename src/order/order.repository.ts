import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { OrderRepository } from './order-repository.interface';
import { Order } from './order.entity';
import { OrderM } from './order.model';

export class DatabaseOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async getOrdersPaginated(
    page = 1,
    limit = 10,
    dateFrom?: string,
    dateTo?: string,
    orderId?: number,
  ): Promise<OrderM[]> {
    const offset = (page - 1) * limit;
    const filters: string[] = ['o."deletedAt" IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (dateFrom) {
      filters.push(`o."dataCompra" >= $${paramIndex++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      filters.push(`o."dataCompra" <= $${paramIndex++}`);
      params.push(dateTo);
    }
    if (orderId) {
      filters.push(`o."idPedido" = $${paramIndex++}`);
      params.push(orderId);
    }
    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const sql = `
      WITH user_orders AS (
        SELECT
          o."idUsuario",
          o."nome",
          o."idPedido",
          TO_CHAR(MAX(o."dataCompra"), 'YYYY-MM-DD') AS date,
          SUM(o."valorProduto")::numeric AS total,
          json_agg(
            json_build_object(
              'product_id', o."idProduto",
              'value', TO_CHAR(o."valorProduto"::numeric, 'FM999999999.00')
            )
          ) AS products
        FROM public."orders" o
        ${whereClause}
        GROUP BY o."idUsuario", o."nome", o."idPedido"
      ),
      grouped AS (
        SELECT
          uo."idUsuario",
          uo."nome",
          json_agg(
            json_build_object(
              'order_id', uo."idPedido",
              'total', TO_CHAR(uo.total, 'FM999999999.00'),
              'date', uo.date,
              'products', uo.products
            ) ORDER BY uo."idPedido"
          ) AS orders
        FROM user_orders uo
        GROUP BY uo."idUsuario", uo."nome"
        ORDER BY uo."idUsuario"
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      )
      SELECT json_agg(
        json_build_object(
          'user_id', g."idUsuario",
          'name', g."nome",
          'orders', g.orders
        )
      ) AS users
      FROM grouped g;
    `;

    params.push(limit, offset);

    const result = await this.dataSource.query(sql, params);
    return result[0]?.users ?? [];
  }

  async insert(order: OrderM): Promise<OrderM> {
    const orderEntity = this.toOrderEntity(order);
    const result = await this.orderRepository.insert(orderEntity);
    return this.toOrder(result.generatedMaps[0] as Order);
  }

  private toOrderEntity(order: OrderM): Order {
    const orderEntity: Order = new Order();

    orderEntity.idUsuario = order.idUsuario;
    orderEntity.nome = order.nome;
    orderEntity.idPedido = order.idPedido;
    orderEntity.idProduto = order.idProduto;
    orderEntity.valorProduto = order.valorProduto;
    orderEntity.dataCompra = order.dataCompra;

    return orderEntity;
  }

  private toOrder(orderEntity: Order): OrderM {
    const order: OrderM = new OrderM();

    order.internalId = orderEntity.internalId;
    order.idUsuario = orderEntity.idUsuario;
    order.nome = orderEntity.nome;
    order.idPedido = orderEntity.idPedido;
    order.idProduto = orderEntity.idProduto;
    order.valorProduto = orderEntity.valorProduto;
    order.dataCompra = orderEntity.dataCompra;

    return order;
  }
}
