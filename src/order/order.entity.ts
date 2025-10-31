import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column({ type: 'bigint' })
  idUsuario: number;

  @Column({ length: 45 })
  nome: string;

  @Column({ type: 'bigint' })
  idPedido: number;

  @Column({ type: 'int' })
  idProduto: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorProduto: number;

  @Column({ type: 'date' })
  dataCompra: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
