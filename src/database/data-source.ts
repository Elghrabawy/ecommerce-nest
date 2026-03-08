import { DataSource } from 'typeorm';
import '../config/env.loader'; // Load environment variables

const isProd = process.env.NODE_ENV === 'production';

export function createDatabaseConfig() {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    entities: isProd ? ['dist/**/*.entity.js'] : ['src/**/*.entity{.ts,.js}'],
    synchronize: false, // NEVER true in production!
    // logging: true, //process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    migrations: isProd
      ? ['dist/database/migrations/*.js']
      : ['src/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: false,

    seeds: isProd
      ? ['dist/database/seeds/**/*.js']
      : ['src/database/seeds/**/*{.ts,.js}'],
    factories: isProd
      ? ['dist/database/seeds/factories/**/*.js']
      : ['src/database/seeds/factories/**/*{.ts,.js}'],
  };
}

// Export DataSource for CLI
export default new DataSource(createDatabaseConfig());
