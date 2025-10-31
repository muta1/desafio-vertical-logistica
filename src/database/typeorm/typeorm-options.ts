import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentConfigService } from '../../environment-config/environment-config.service';

export const getTypeOrmModuleOptions = (
  config: EnvironmentConfigService,
): TypeOrmModuleOptions =>
  ({
    type: 'postgres',
    host: config.getDatabaseHost(),
    port: config.getDatabasePort(),
    username: config.getDatabaseUser(),
    password: config.getDatabasePassword(),
    database: config.getDatabaseName(),
    entities: [__dirname + './../../**/*.entity{.ts,.js}'],
    synchronize: config.getDatabaseSync(),
    schema: config.getDatabaseSchema(),
    migrationsRun: true,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    dropSchema: true,
    cli: {
      migrationsDir: 'src/migrations',
    },
  }) as TypeOrmModuleOptions;
