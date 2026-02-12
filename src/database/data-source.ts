
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: '.env.development' });

export function createDatabaseConfig() {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false, // NEVER true in production!
    logging: process.env.NODE_ENV === 'development',
    migrations: ['src/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: false,
  };
}

// Export DataSource for CLI
export default new DataSource(createDatabaseConfig());
