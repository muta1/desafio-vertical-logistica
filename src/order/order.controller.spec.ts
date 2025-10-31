import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseOrderRepository } from './order.repository';
import { StreamableFile } from '@nestjs/common';
import { PassThrough } from 'stream';
import type { Request } from 'express';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;
  let databaseOrderRepository: DatabaseOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            getOrdersPaginated: jest.fn(),
            parseFixedWidthLine: jest.fn(),
          },
        },
        {
          provide: DatabaseOrderRepository,
          useValue: {
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
    databaseOrderRepository = module.get<DatabaseOrderRepository>(
      DatabaseOrderRepository,
    );
  });

  describe('getOrders', () => {
    it('should call getOrdersPaginated with default values', async () => {
      await orderController.getOrders();
      expect(orderService.getOrdersPaginated).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should call getOrdersPaginated with provided values', async () => {
      await orderController.getOrders(2, 20, '2025-01-01', '2025-12-31', 123);
      expect(orderService.getOrdersPaginated).toHaveBeenCalledWith(
        2,
        20,
        '2025-01-01',
        '2025-12-31',
        123,
      );
    });
  });

  describe('uploadFileStream', () => {
    it('should process a valid file stream', async () => {
      const fileContent =
        '0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308';
      const mockRequest = new PassThrough();
      mockRequest.write(fileContent);
      mockRequest.end();

      const parsedOrder = {
        user_id: 70,
        name: 'Palmer Prosacco',
        order_id: 753,
        product_id: 3,
        value: 1836.74,
        date: '2021-03-08',
      };

      (orderService.parseFixedWidthLine as jest.Mock).mockReturnValue(
        parsedOrder,
      );
      (databaseOrderRepository.insert as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await orderController.uploadFileStream(
        mockRequest as unknown as Request,
      );

      expect(result).toBeInstanceOf(StreamableFile);

      const stream = result.getStream();
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const output = Buffer.concat(chunks).toString('utf-8');

      expect(output).toBe(JSON.stringify([parsedOrder]));
      expect(orderService.parseFixedWidthLine).toHaveBeenCalledWith(
        fileContent,
      );
      expect(databaseOrderRepository.insert).toHaveBeenCalledWith(parsedOrder);
    });
  });
});
