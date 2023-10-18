import WebSocket from 'isomorphic-ws';
// import url from 'url';

import { EventEmitter } from 'events';

interface Events {
    open(): void,
    close(code: number, reason: string): void,
    message(message: WebSocket.Data): void,
}

export declare interface AutoReconnectWebSocket {
    on<U extends keyof Events>(
        event: U, listener: Events[U]
    ): this;

    emit<U extends keyof Events>(
        event: U, ...args: Parameters<Events[U]>
    ): boolean;
}

export class AutoReconnectWebSocket extends EventEmitter {
    private headers: Record<string, string | undefined> | undefined;
    websocketBaseUrl: string;
    websocket: WebSocket | undefined = undefined;
    pingTimer: NodeJS.Timeout | undefined = undefined;
    pongReceived: boolean = true;

    constructor(baseUrl: string, subApiPath: string, authenticationHeader: object = {}) {
        super();

        const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;

        const url = new URL(baseUrl);

        this.websocketBaseUrl = (useUnixSocket)
            ? "ws+unix:///run" + url.pathname + ":" + subApiPath
            : baseUrl.replace(/^(http)/, "ws") + subApiPath;
        console.log('using socket:', this.websocketBaseUrl);

        this.headers = {
            ...authenticationHeader
        }

        this.connectWebsocket();

        // @ts-ignore
        if (typeof window === 'undefined') {
            this.pingTimer = setInterval(() => {
                if (this.websocket !== undefined && this.websocket.OPEN == this.websocket.readyState) {
                    this.websocket.ping();
                    if (this.pongReceived === false) {
                        this.websocket.close();
                    }
                    this.pongReceived = false;
                }
            }, 5000);
        }
    }

    private connectWebsocket() {
        this.pongReceived = true;
        try {
            // @ts-ignore
            if (typeof window === 'undefined') {
                this.websocket = new WebSocket(this.websocketBaseUrl, {
                    headers: {
                        ...this.headers
                    }
                });
                this.websocket.on('open', this.onOpen.bind(this));
                this.websocket.on('close', this.onClose.bind(this));
                this.websocket.on('error', this.onError.bind(this));
                this.websocket.on('pong', this.onPong.bind(this));

                this.websocket.on('message', this.onMmessage.bind(this));
            }
            else {
                this.websocket = new WebSocket(this.websocketBaseUrl);
                this.websocket.addEventListener('message', (event) => {
                    this.onMmessage(event.data);
                });
            }
        }
        catch (error) {
            setTimeout(
                () => {
                    console.log("reconnecting...");
                    this.connectWebsocket();
                }, 10000);
        }
    }

    disconnect() {
        if (undefined !== this.pingTimer)
            clearInterval(this.pingTimer);
        if (undefined !== this.websocket) {
            this.websocket.removeAllListeners('close');
            this.websocket.close();
        }
    }

    private onOpen() {
        console.log("connection to " + this.websocketBaseUrl + " complete");
        this.emit("open");
    }

    private onClose(code: number, reason: string) {
        console.log("connection to " + this.websocketBaseUrl + " closed");
        console.log("try to reconnect in 10 seconds...");
        setTimeout(
            () => {
                console.log("try to reconnec to "+ this.websocketBaseUrl);
                this.connectWebsocket();
            }, 10000);
        this.emit('close', code, reason);
    }

    private onError(err: Error) {
        console.error('❌', err.toString())
    }

    private onPong() {
        this.pongReceived = true;
    }

    private onMmessage(message: WebSocket.Data) {
        this.emit('message', message);
    };

    send(data: any, cb?: (err?: Error) => void): void {
        this.websocket?.send(data, cb);
    }

    close() {
        if (undefined !== this.websocket) {
            this.websocket.removeAllListeners();
            this.websocket.close();
        }
    }
}