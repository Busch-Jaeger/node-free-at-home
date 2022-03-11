import { AutoReconnectWebSocket } from "./autoReconnectWebSocket";
import { WebsocketStreamReader } from './websocketStreamReader';

const baseUrl = process.env.FREEATHOME_SERIAL_API_BASE_URL
    ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + "/api/serial/v1" : "http://localhost/api/serial/v1");
const username = process.env.FREEATHOME_API_USERNAME ?? "installer";
const password = process.env.FREEATHOME_API_PASSWORD ?? "12345";
const authenticationHeader = {
    Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
};

export function CreateSerialWebSocket(options: OpenOptions) {
    let params = "?";
    if(undefined !== options.baudRate)
        params += "baudrate=" + options.baudRate + "&";
    if(undefined !== options.parity)
        params += "parity=" + options.parity + "&";

    const websocket = new AutoReconnectWebSocket(baseUrl, "/" + options.path + "/websocket" + params, {
        ...authenticationHeader
    });

    return websocket;
}

import { BindingInterface, BindingPortInterface, OpenOptions, UpdateOptions, SetOptions, PortStatus, PortInfo } from '@serialport/bindings-interface';
export class SerialPortBinding implements BindingPortInterface {
    openOptions: Required<OpenOptions>;
    isOpen: boolean = true;
    websocket: AutoReconnectWebSocket;
    streamReader: WebsocketStreamReader;
    constructor(options: OpenOptions) {
        this.openOptions = options as Required<OpenOptions>;
        this.websocket = CreateSerialWebSocket(options)
        this.streamReader = new WebsocketStreamReader(this.websocket);
    }

    waitForOpen(): Promise<void> {
        return new Promise<void>(
            (resolve, reject) => {
                this.websocket.on("open", () => {
                    resolve();
                });
            });
    }
    close(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    read(buffer: Buffer, offset: number, length: number): Promise<{ buffer: Buffer; bytesRead: number; }> {
        return new Promise<{ buffer: Buffer; bytesRead: number; }>(
            (resolve, reject) => {
                this.streamReader.once("readable", () => {
                    let chunk: Buffer = this.streamReader.read(1);
                    const count = chunk.copy(buffer, offset);
                    resolve({ buffer, bytesRead: count });
                });
            });
    }
    write(buffer: Buffer): Promise<void> {
        return new Promise<void>(
            (resolve, reject) => {
                this.websocket.send(buffer, (err?: Error | null) => {
                    if (err)
                        return reject();
                    resolve();
                });
            });
        // throw new Error("Method not implemented.");
    }
    update(options: UpdateOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
    set(options: SetOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
    get(): Promise<PortStatus> {
        throw new Error("Method not implemented.");
    }
    getBaudRate(): Promise<{ baudRate: number; }> {
        throw new Error("Method not implemented.");
    }
    flush(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    drain(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export class SerialBinding implements BindingInterface {
    async list(): Promise<PortInfo[]> {
        return await [
            {
                path: "USB0",
                manufacturer: undefined,
                serialNumber: undefined,
                pnpId: undefined,
                locationId: undefined,
                productId: undefined,
                vendorId: undefined,
            }
        ];
    }
    async open(options: OpenOptions): Promise<BindingPortInterface> {
        const binding = new SerialPortBinding(options);
        await binding.waitForOpen();
        return binding;
    }
}

import { SerialPortStream } from '@serialport/stream'
import rewiremock from 'rewiremock';

class FreeAtHomeSerialPortStream extends SerialPortStream {
    constructor(options: OpenOptions, openCallback?: ErrorCallback) {
        super({ ...options, binding: new SerialBinding });
    }
}

export function EnableSerialMock() {
    rewiremock('serialport')
        .with({
            SerialPort: FreeAtHomeSerialPortStream
        });

    rewiremock.enable()
}
