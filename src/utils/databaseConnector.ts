
/**
 * Database Connector Utility
 * Provides functions to connect to NeonDB or Supabase
 */

type DatabaseType = 'neondb' | 'supabase';

type ConnectionConfig = {
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
  private connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
  private lastError: string | null = null;

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
   * Configure NeonDB connection
   */
  public configureNeonDb(connectionString: string): void {
    console.log('Configuring NeonDB connection...');
    this.config.neondb = { connectionString };
    this.currentConnection = 'neondb';
    this.connectionStatus = 'disconnected'; // Reset status
    this.lastError = null;
    this.saveConnectionConfig();
  }

  /**
   * Configure Supabase connection
   */
  public configureSupabase(url: string, key: string): void {
    console.log('Configuring Supabase connection...');
    this.config.supabase = { url, key };
    this.currentConnection = 'supabase';
    this.connectionStatus = 'disconnected'; // Reset status
    this.lastError = null;
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
   * Get connection status
   */
  public getConnectionStatus(): 'connected' | 'disconnected' | 'error' {
    return this.connectionStatus;
  }

  /**
   * Get last error
   */
  public getLastError(): string | null {
    return this.lastError;
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
        this.lastError = 'Failed to load saved configuration';
      }
    }
  }

  /**
   * Test the current connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.currentConnection) {
      console.error('No database configured');
      this.connectionStatus = 'error';
      this.lastError = 'No database configured';
      return false;
    }

    try {
      switch (this.currentConnection) {
        case 'neondb':
          console.log('Testing NeonDB connection...');
          if (!this.config.neondb?.connectionString) {
            throw new Error('NeonDB connection string is not configured');
          }
          // In a production app, we would actually try to connect
          this.connectionStatus = 'connected';
          return true;
        case 'supabase':
          console.log('Testing Supabase connection...');
          if (!this.config.supabase?.url || !this.config.supabase?.key) {
            throw new Error('Supabase credentials are not configured');
          }
          // In a production app, we would actually try to connect
          this.connectionStatus = 'connected';
          return true;
        default:
          throw new Error('Unknown database type');
      }
    } catch (error) {
      console.error(`Failed to test ${this.currentConnection} connection`, error);
      this.connectionStatus = 'error';
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  /**
   * Get direct connection to the current database (this would be implemented with actual DB clients)
   */
  public async getConnection() {
    if (!this.currentConnection) {
      throw new Error('No database configured');
    }

    if (this.connectionStatus !== 'connected') {
      const success = await this.testConnection();
      if (!success) {
        throw new Error(`Failed to connect to ${this.currentConnection}: ${this.lastError}`);
      }
    }

    // This would return the actual connection object in a real implementation
    return {
      type: this.currentConnection,
      isConnected: this.connectionStatus === 'connected'
    };
  }

  /**
   * Export database to JSON
   */
  public async exportToJson(): Promise<string> {
    // This is a mock implementation
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      database: this.currentConnection,
      tables: [
        { name: "users", records: 42 },
        { name: "tasks", records: 156 },
        { name: "discussions", records: 28 }
      ]
    });
  }

  /**
   * Import data from JSON
   */
  public async importFromJson(jsonData: string): Promise<boolean> {
    try {
      // This is a mock implementation
      const data = JSON.parse(jsonData);
      console.log("Importing data:", data);
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }
}

export const databaseConnector = DatabaseConnector.getInstance();
