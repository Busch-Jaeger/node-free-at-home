import WebSocket from 'ws';

export class FreeAtHomeWebsocket extends WebSocket {
    pingTimer: NodeJS.Timeout | undefined;
    pongReceived: boolean;

    constructor(baseUrl: string, subApiPath: string, authenticationHeader: object = {}) {
        const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;

        const url = new URL(baseUrl);

        const websocketBaseUrl = (useUnixSocket)
            ? "ws+unix:///run" + url.pathname + ":" + subApiPath
            : baseUrl.replace(/^(http)/, "ws") + subApiPath;

        const headers = {
            ...authenticationHeader
        }
        super(websocketBaseUrl, {
            headers: {
                ...headers
            }
        });

        this.pongReceived = true;

        // @ts-ignore
        if (typeof window === 'undefined') {
            this.on('pong', this.onPong.bind(this));
            this.pingTimer = setInterval(() => {
                if (this.OPEN == this.readyState) {
                    this.ping();
                    if (this.pongReceived === false) {
                        this.close();
                    }
                    this.pongReceived = false;
                }
            }, 5000);
        }
    }

    private onPong() {
        this.pongReceived = true;
    }

    disconnect() {
        if (undefined !== this.pingTimer)
            clearInterval(this.pingTimer);
        this.removeAllListeners('close');
        this.close();
    }

}