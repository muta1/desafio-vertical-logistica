import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env.test' });

if (
  !process.env.DATABASE_HOST ||
  !process.env.DATABASE_PORT ||
  !process.env.DATABASE_USER ||
  !process.env.DATABASE_PASSWORD ||
  !process.env.DATABASE_NAME ||
  !process.env.DATABASE_SYNCHRONIZE ||
  !process.env.DATABASE_SCHEMA
) {
  throw new Error('Please define all required environment variables in .env.test');
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  schema: process.env.DATABASE_SCHEMA,
});
