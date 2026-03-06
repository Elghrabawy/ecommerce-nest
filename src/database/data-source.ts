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
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false, // NEVER true in production!
    // logging: true, //process.env.NODE_ENV === 'development',
    migrations: ['src/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: false,
    seeds: ['src/database/seeds/**/*{.ts,.js}'],
    factories: ['src/database/seeds/factories/**/*{.ts,.js}'],
    ssl: {
      rejectUnauthorized: false, // For development with self-signed certs; adjust for production
    },
  };
}

// Export DataSource for CLI
export default new DataSource(createDatabaseConfig());
