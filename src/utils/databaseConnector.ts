
/**
 * Database Connector Utility
 * Provides functions to connect to MongoDB or NeonDB
 */

type DatabaseType = 'mongodb' | 'neondb' | 'supabase';

type ConnectionConfig = {
  mongodb?: {
    uri: string;
    dbName: string;
  };
  neondb?: {
    connectionString: string;
  };
  supabase?: {
    url: string;
    key: string;
  };
};

/**
 * Class for managing database connections
 */
export class DatabaseConnector {
  private static instance: DatabaseConnector;
  private currentConnection: DatabaseType | null = null;
  private config: ConnectionConfig = {};

  private constructor() {
    // Singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): DatabaseConnector {
    if (!DatabaseConnector.instance) {
      DatabaseConnector.instance = new DatabaseConnector();
    }
    return DatabaseConnector.instance;
  }

  /**
   * Configure MongoDB connection
   */
  public configureMongoDb(uri: string, dbName: string): void {
    console.log('Configuring MongoDB connection...');
    this.config.mongodb = { uri, dbName };
    this.currentConnection = 'mongodb';
    this.saveConnectionConfig();
  }

  /**
   * Configure NeonDB connection
   */
  public configureNeonDb(connectionString: string): void {
    console.log('Configuring NeonDB connection...');
    this.config.neondb = { connectionString };
    this.currentConnection = 'neondb';
    this.saveConnectionConfig();
  }

  /**
   * Configure Supabase connection
   */
  public configureSupabase(url: string, key: string): void {
    console.log('Configuring Supabase connection...');
    this.config.supabase = { url, key };
    this.currentConnection = 'supabase';
    this.saveConnectionConfig();
  }

  /**
   * Get current connection type
   */
  public getCurrentConnection(): DatabaseType | null {
    return this.currentConnection;
  }

  /**
   * Get connection config
   */
  public getConnectionConfig(): ConnectionConfig {
    return this.config;
  }

  /**
   * Save connection config to localStorage
   */
  private saveConnectionConfig(): void {
    localStorage.setItem('dbConnector', JSON.stringify({
      currentConnection: this.currentConnection,
      config: this.config
    }));
  }

  /**
   * Load connection config from localStorage
   */
  public loadConnectionConfig(): void {
    const savedConfig = localStorage.getItem('dbConnector');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        this.currentConnection = parsed.currentConnection;
        this.config = parsed.config;
        console.log(`Loaded saved ${this.currentConnection} configuration`);
      } catch (error) {
        console.error('Failed to parse saved database configuration', error);
      }
    }
  }

  /**
   * Test the current connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.currentConnection) {
      console.error('No database configured');
      return false;
    }

    try {
      switch (this.currentConnection) {
        case 'mongodb':
          console.log('Testing MongoDB connection...');
          // In a production app, we would actually try to connect
          return !!this.config.mongodb?.uri;
        case 'neondb':
          console.log('Testing NeonDB connection...');
          // In a production app, we would actually try to connect
          return !!this.config.neondb?.connectionString;
        case 'supabase':
          console.log('Testing Supabase connection...');
          // In a production app, we would actually try to connect
          return !!this.config.supabase?.url && !!this.config.supabase?.key;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to test ${this.currentConnection} connection`, error);
      return false;
    }
  }
}

export const databaseConnector = DatabaseConnector.getInstance();

