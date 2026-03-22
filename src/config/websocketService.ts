// import { tokenManagement } from '@utils/tokenManagement';

// type WebSocketCallback = (payload: unknown) => void;

// class WebSocketService {
//   private ws: WebSocket | null = null;
//   private subscriptions: Record<string, WebSocketCallback[]> = {};
//   private shouldReconnect = true;
//   private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

//   connect(): void {
//     if (
//       this.ws &&
//       (this.ws.readyState === WebSocket.OPEN ||
//         this.ws.readyState === WebSocket.CONNECTING)
//     ) {
//       return;
//     }

//     const accessToken = tokenManagement.getAccessToken();
//     const url = `${import.meta.env.VITE_WS_URL}?access_token=${accessToken}`;

//     this.ws = new WebSocket(url);

//     this.ws.onopen = (): void => {
//       console.log('✅ WebSocket connected');
//     };

//     this.ws.onmessage = (event: MessageEvent): void => {
//       try {
//         const { type, payload } = JSON.parse(event.data);
//         console.log('WebSocket type received:', type);
//         console.log('WebSocket data received:', payload);
//         if (type && this.subscriptions[type]) {
//           this.subscriptions[type].forEach((callback) => callback(payload));
//         }
//       } catch (error) {
//         console.error('❌ WS parse error:', error);
//       }
//     };

//     this.ws.onclose = (): void => {
//       console.log('⚠️ WebSocket closed');
//       if (this.shouldReconnect) {
//         this.reconnectTimeout = setTimeout(() => {
//           console.log('🔄 Reconnecting WebSocket...');
//           this.connect();
//         }, 3000);
//       }
//     };

//     this.ws.onerror = (error: Event): void => {
//       console.error('❌ WebSocket error:', error);
//     };
//   }

//   subscribe(type: string, callback: WebSocketCallback): void {
//     if (!this.subscriptions[type]) {
//       this.subscriptions[type] = [];
//     }

//     this.subscriptions[type].push(callback);
//   }

//   unsubscribe(type: string, callback: WebSocketCallback): void {
//     if (!this.subscriptions[type]) return;

//     this.subscriptions[type] = this.subscriptions[type].filter(
//       (cb) => cb !== callback
//     );

//     if (this.subscriptions[type].length === 0) {
//       delete this.subscriptions[type];
//     }
//   }

//   close(): void {
//     this.shouldReconnect = false;

//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//       this.reconnectTimeout = null;
//     }

//     if (this.ws) {
//       this.ws.close();
//       this.ws = null;
//     }
//   }

//   reconnect(): void {
//     console.log('🔄 Force reconnect WebSocket...');
//     this.close();
//     this.shouldReconnect = true;
//     this.connect();
//   }
// }

// export const websocketService = new WebSocketService();
