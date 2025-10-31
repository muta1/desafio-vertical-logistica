import { Module } from '@nestjs/common';

import { OrderController } from './order.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '../database/database.module';
import { Order } from './order.entity';
import { DatabaseOrderRepository } from './order.repository';
import { OrderService } from './order.service';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Order])],
  controllers: [OrderController],
  providers: [OrderService, DatabaseOrderRepository],
})
export class OrderModule {}
