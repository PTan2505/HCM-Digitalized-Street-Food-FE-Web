import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { tokenManagement } from '@utils/tokenManagement';
import { ENV } from './env';

class SignalRService {
  private connection: HubConnection | null = null;

  async connect(): Promise<HubConnection | null> {
    // tránh connect lại nếu đang connected/connecting
    if (
      this.connection &&
      (this.connection.state === HubConnectionState.Connected ||
        this.connection.state === HubConnectionState.Connecting)
    ) {
      return this.connection;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(ENV.signalr.url, {
        accessTokenFactory: () => tokenManagement.getAccessToken() || '',
        skipNegotiation: true,
        transport: 1,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('✅ SignalR connected');
      return this.connection;
    } catch (error) {
      console.error('❌ SignalR connect failed:', error);
      this.connection = null;
      return null;
    }
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.connection?.on(event, callback);
  }

  off<T>(event: string, callback: (data: T) => void): void {
    this.connection?.off(event, callback);
  }

  getConnection(): HubConnection | null {
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }
}

export const signalRService = new SignalRService();
