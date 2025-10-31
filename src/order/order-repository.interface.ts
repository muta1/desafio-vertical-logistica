import { OrderM } from './order.model';

export interface OrderRepository {
  insert(order: OrderM): Promise<OrderM>;
  getOrdersPaginated(
    page: number,
    limit: number,
    dateFrom?: string,
    dateTo?: string,
    orderId?: number,
  ): Promise<OrderM[]>;
}
