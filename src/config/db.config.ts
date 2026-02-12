import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { createDatabaseConfig } from '../database/data-source';

export default registerAs('database', (): PostgresConnectionOptions => {
  const baseConfig = createDatabaseConfig();

  return {
    ...baseConfig,
    // NestJS-specific overrides (different entity paths for runtime)
    entities: [__dirname + '../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '../database/migrations/*{.ts,.js}'],
    autoLoadEntities: true, // NestJS feature for automatic entity discovery
  } as PostgresConnectionOptions;
});
