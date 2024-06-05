import { JSONRPCServer, JSONRPCParams, SimpleJSONRPCMethod } from "json-rpc-2.0";
import { AutoReconnectWebSocket } from "./autoReconnectWebSocket";
import * as API from './rpc';

export { JSONRPCParams };

const REST_PATH = "/api/rpc/v1";

const baseUrl = process.env.FREEATHOME_RPC_API_BASE_URL
    ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + REST_PATH : "http://localhost" + REST_PATH);
const username = process.env.FREEATHOME_API_USERNAME ?? "installer";
const password = process.env.FREEATHOME_API_PASSWORD ?? "12345";

const apiClient = new API.RpcClient({
    BASE: baseUrl,
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
