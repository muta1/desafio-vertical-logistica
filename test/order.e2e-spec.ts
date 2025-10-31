import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrderController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /orders should return 200', () => {
    return request(app.getHttpServer()).get('/orders').expect(200);
  });

  it('POST /upload should process the file and return 201', async () => {
    const filePath = join(__dirname, '../assets', 'data_1.txt');
    const fileContent = readFileSync(filePath);

    const response = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', fileContent, 'data_1.txt')
      .expect(201);

    expect(response.body).toBeInstanceOf(Array);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('idUsuario');
      expect(response.body[0]).toHaveProperty('nome');
      expect(response.body[0]).toHaveProperty('idPedido');
      expect(response.body[0]).toHaveProperty('idProduto');
      expect(response.body[0]).toHaveProperty('valorProduto');
      expect(response.body[0]).toHaveProperty('dataCompra');
    }
  }, 10000);
});
