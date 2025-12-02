// WebSocket stub for browser environment
// This is used when CCXT tries to import 'ws' on client-side
export default class WebSocketStub {
  constructor() {
    console.warn('WebSocket is not available in browser context. Use server-side API instead.');
  }
}
