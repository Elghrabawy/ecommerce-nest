import path from 'path';
import { DataSource } from 'typeorm';
import '../config/env.loader'; // Load environment variables

export function createDatabaseConfig() {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: false, // NEVER true in production!
    // logging: true, //process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    migrationsTableName: 'migrations',
    migrationsRun: false,

    seeds: [path.join(__dirname, './seeds/**/*{.ts,.js}')],
    factories: [path.join(__dirname, './seeds/factories/**/*{.ts,.js}')],
  };
}

// Export DataSource for CLI
export default new DataSource(createDatabaseConfig());
