import { AutoReconnectWebSocket } from "./autoReconnectWebSocket";

const baseUrl = process.env.FREEATHOME_SERIAL_API_BASE_URL
    ?? (process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + "/api/serial/v1" : "http://localhost/api/serial/v1";
const username = process.env.FREEATHOME_API_USERNAME ?? "installer";
const password = process.env.FREEATHOME_API_PASSWORD ?? "12345";
const authenticationHeader = {
    Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
};

export function CreateSerialWebSocket(device: string) {
    const websocket = new AutoReconnectWebSocket(baseUrl, "/" + device + "/websocket", {
        ...authenticationHeader
    });

    return websocket;
}
