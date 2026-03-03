import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { createDatabaseConfig } from '../database/data-source';
import { Logger } from '@nestjs/common';
import './env.loader';

const config = registerAs('database', (): PostgresConnectionOptions => {
  const baseConfig = createDatabaseConfig();

  return {
    ...baseConfig,
    // NestJS-specific overrides (different entity paths for runtime)
    entities: [__dirname + '../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '../database/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
  } as PostgresConnectionOptions;
});

export default config;

const logger = new Logger('DatabaseConfig');
logger.debug('Database configuration loaded successfully', config);
