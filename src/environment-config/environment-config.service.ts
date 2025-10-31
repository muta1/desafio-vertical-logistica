import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../database/interfaces/database-config.interface';

@Injectable()
export class EnvironmentConfigService implements DatabaseConfig {
  constructor(private configService: ConfigService) {}

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST') || 'localhost';
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT') || 5432;
  }

  getDatabaseUser(): string {
    return this.configService.get<string>('DATABASE_USER') || 'test_user';
  }

  getDatabasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD') || 'test_password';
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME') || 'test_db';
  }

  getDatabaseSchema(): string {
    return this.configService.get<string>('DATABASE_SCHEMA') || 'public';
  }

  getDatabaseSync(): boolean {
    return this.configService.get<boolean>('DATABASE_SYNCHRONIZE') || true;
  }
}
