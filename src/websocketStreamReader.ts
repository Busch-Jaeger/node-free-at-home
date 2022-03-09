import { Readable, ReadableOptions } from 'stream';
import { AutoReconnectWebSocket } from './autoReconnectWebSocket';

export class WebsocketStreamReader extends Readable {
  constructor(websocket: AutoReconnectWebSocket, options?: ReadableOptions) {
    super({highWaterMark:1 ,...options});
    websocket.on('message', (message: string) => {
        this.push(message, 'utf-8');
    });
  }

  _read(size: number): void {
      
  }
}

export default WebsocketStreamReader;
