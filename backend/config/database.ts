import "reflect-metadata";
import { DataSource } from "typeorm";
import { configService } from "./config.service";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.database.host,
  port: configService.database.port,
  username: configService.database.username,
  password: configService.database.password,
  database: configService.database.database,
  synchronize: configService.isDevelopment, // Auto-sync schema in development only
  logging: false,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};
