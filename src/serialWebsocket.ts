import { FreeAtHomeWebsocket } from "./freeAtHomeWebsocket";
import { createWebSocketStream } from 'ws';
import * as stream from "stream";
import * as API from './serial';
import { SerialPortStream } from '@serialport/stream';
import type { ErrorCallback, OpenOptions } from '@serialport/stream';
import { BindingInterface, BindingPortInterface, UpdateOptions, SetOptions, PortStatus, PortInfo } from '@serialport/bindings-interface';
import rewiremock from 'rewiremock';
import { handleRequestError } from "./utilities";

const REST_PATH = "/api/serial/v1";

const baseUrl = process.env.FREEATHOME_SERIAL_API_BASE_URL
    ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + REST_PATH : "http://localhost" + REST_PATH);
const username = process.env.FREEATHOME_API_USERNAME ?? "installer";
const password = process.env.FREEATHOME_API_PASSWORD ?? "12345";
const authenticationHeader = {
    Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
};

const apiClient = new API.SerialClient({
    BASE: baseUrl,
    USERNAME: username,
    PASSWORD: password
});

export function CreateSerialWebSocket(options: OpenOptions) {
    let params = "?";
    if (undefined !== options.baudRate)
        params += "baudrate=" + options.baudRate + "&";
    if (undefined !== options.parity)
        params += "parity=" + options.parity + "&";

    const websocket = new FreeAtHomeWebsocket(baseUrl, "/" + options.path + "/websocket" + params, {
        ...authenticationHeader
    });

    return websocket;
}

export class SerialPortBinding implements BindingPortInterface {
    openOptions: Required<OpenOptions>;
    isOpen: boolean = true;
    websocket: FreeAtHomeWebsocket;
    stream: stream.Duplex;
    constructor(options: OpenOptions) {
        this.openOptions = options as Required<OpenOptions>;
        this.websocket = CreateSerialWebSocket(options);
        this.stream = createWebSocketStream(this.websocket);
    }

    waitForOpen(): Promise<SerialPortBinding> {
        return new Promise<SerialPortBinding>(
            (resolve, reject) => {
                this.websocket.on("open", () => {
                    resolve(this);
                });
                this.stream.on("error", (err: Error) => {
                    reject(err);
                });
            });
    }
    close(): Promise<void> {
        return new Promise<void>(
            (resolve) => {
                this.websocket.close();
                resolve();
            });
    }
    read(buffer: Buffer, offset: number, length: number): Promise<{ buffer: Buffer; bytesRead: number; }> {
        return new Promise<{ buffer: Buffer; bytesRead: number; }>(
            (resolve, reject) => {
                this.stream.once("readable", () => {
                    let chunk: Buffer = this.stream.read(1);
                    if (null === chunk) {
                        reject(new Error("broken pipe"));
                        return;
                    }
                    const count = chunk.copy(buffer, offset);
                    resolve({ buffer, bytesRead: count });
                });
            });
    }
    write(buffer: Buffer): Promise<void> {
        return new Promise<void>(
            (resolve, reject) => {
                try {
                    this.stream.write(buffer, (err?: Error | null) => {
                        if (err)
                            return reject(err);
                        resolve();
                    });


                }
                catch (err) {
                    reject();
                }
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
        console.error("SerialPortBinding.flush method not implemented.");
        return Promise.resolve();
    }
    drain(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export class SerialBinding implements BindingInterface {
    async list(): Promise<PortInfo[]> {
        try {
            const result = await apiClient.serial.getSettings();
            return result.map((device): PortInfo => {
                return {
                    path: device.sysName,
                    manufacturer: device.manufacturer,
                    serialNumber: device.serialNumber,
                    pnpId: undefined,
                    locationId: undefined,
                    productId: device.pID,
                    vendorId: device.vID,
                }
            });
        } catch (e) {
            handleRequestError(e);
            return [];
        }
    }
    async open(options: OpenOptions): Promise<BindingPortInterface> {
        const binding = new SerialPortBinding(options);
        const p = binding.waitForOpen();
        p.catch(e => {
            handleRequestError(e);
        });
        return p;
    }
}

class FreeAtHomeSerialPortStream extends SerialPortStream {
    constructor(options: OpenOptions, openCallback?: ErrorCallback) {
        super({ ...options, binding: new SerialBinding });
    }
    static list() {
        const binding = new SerialBinding;
        return binding.list();
    }
}

export function EnableSerialMock() {
    rewiremock('serialport')
        .with({
            SerialPort: FreeAtHomeSerialPortStream
        });

    rewiremock.enable()
}
