import * as dotenv from "dotenv";
import * as path from "path";
import { URL } from "url";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

class ConfigService {
  private readonly envConfig: Record<string, string>;
  private readonly dbConfig: DatabaseConfig;

  constructor() {
    this.envConfig = this.validateConfig();
    this.dbConfig = this.parseDatabaseConfig();
  }

  private parseDatabaseConfig(): DatabaseConfig {
    // Check if DATABASE_URI exists (connection string format)
    if (process.env.DATABASE_URI) {
      try {
        const dbUrl = new URL(process.env.DATABASE_URI);
        return {
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port, 10) || 5432,
          username: dbUrl.username,
          password: dbUrl.password,
          database: dbUrl.pathname.slice(1), // Remove leading slash
        };
      } catch (error) {
        throw new Error(`Invalid DATABASE_URI format: ${error}`);
      }
    }

    // Fall back to individual variables
    return {
      host: this.envConfig.DB_HOST,
      port: parseInt(this.envConfig.DB_PORT, 10),
      username: this.envConfig.DB_USERNAME,
      password: this.envConfig.DB_PASSWORD,
      database: this.envConfig.DB_DATABASE,
    };
  }

  private validateConfig(): Record<string, string> {
    const requiredEnvVars = ["NODE_ENV", "PORT"];

    // Check for DATABASE_URI or individual DB variables
    const hasDatabaseUri = !!process.env.DATABASE_URI;
    const hasIndividualDbVars = !!(
      process.env.DB_HOST &&
      process.env.DB_PORT &&
      process.env.DB_USERNAME &&
      process.env.DB_PASSWORD &&
      process.env.DB_DATABASE
    );

    if (!hasDatabaseUri && !hasIndividualDbVars) {
      throw new Error(
        "Missing database configuration. Provide either:\n" +
          "  - DATABASE_URI (connection string), or\n" +
          "  - All of: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE",
      );
    }

    const missingVars: string[] = [];
    const config: Record<string, string> = {};

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (!value) {
        missingVars.push(envVar);
      } else {
        config[envVar] = value;
      }
    }

    // Add individual DB vars if they exist
    if (hasIndividualDbVars) {
      config.DB_HOST = process.env.DB_HOST!;
      config.DB_PORT = process.env.DB_PORT!;
      config.DB_USERNAME = process.env.DB_USERNAME!;
      config.DB_PASSWORD = process.env.DB_PASSWORD!;
      config.DB_DATABASE = process.env.DB_DATABASE!;
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}\n` +
          "Please check your .env file and ensure all required variables are set.",
      );
    }

    return config;
  }

  get(key: string): string {
    const value = this.envConfig[key];
    if (!value) {
      throw new Error(`Configuration key "${key}" not found`);
    }
    return value;
  }

  get nodeEnv(): string {
    return this.get("NODE_ENV");
  }

  get port(): number {
    return parseInt(this.get("PORT"), 10);
  }

  get database(): DatabaseConfig {
    return this.dbConfig;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === "development";
  }

  get isProduction(): boolean {
    return this.nodeEnv === "production";
  }
}

export const configService = new ConfigService();
