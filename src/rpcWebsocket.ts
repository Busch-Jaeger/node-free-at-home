import { JSONRPCServer, JSONRPCParams, SimpleJSONRPCMethod } from "json-rpc-2.0";
import { AutoReconnectWebSocket } from "./autoReconnectWebSocket";
import * as API from './rpc';

export { JSONRPCParams };

const baseUrl = process.env.FREEATHOME_RPC_API_BASE_URL
    ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + "/api/rpc/v1" : "http://localhost/api/rpc/v1");
const username = process.env.FREEATHOME_API_USERNAME ?? "installer";
const password = process.env.FREEATHOME_API_PASSWORD ?? "12345";
const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;


const apiClient = new API.RpcClient({
    BASE: (useUnixSocket) ? "http://localhost" : baseUrl + "/api/rpc/v1",
    USERNAME: username,
    PASSWORD: password
});

export class RpcWebsocket {
    server: JSONRPCServer;
    websocket: AutoReconnectWebSocket;
    constructor(ref: string) {
        this.server = new JSONRPCServer()

        const username: string = process.env.FREEATHOME_API_USERNAME || "installer";
        const password: string = process.env.FREEATHOME_API_PASSWORD || "12345";

        const authenticationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        this.websocket = new AutoReconnectWebSocket(baseUrl, "/" + ref + "/websocket", {
            ...authenticationHeader
        });

        this.websocket.on("message", async (message: string) => {
            console.log(message);
            const result = await this.server.receiveJSON(message);
            this.websocket.send(JSON.stringify(result));
        });
    }

    addMethod(name: string, method: SimpleJSONRPCMethod): void {
        this.server.addMethod(name, method)
    }

    close() {
        this.websocket.close();
    }

}

export function UploadAuxiliaryDeviceData(reference: string, body?: string | undefined) {
    return apiClient.rpc.uploadAuxiliaryDeviceData(reference, body);
}
