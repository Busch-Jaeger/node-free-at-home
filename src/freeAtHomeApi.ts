import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import WebSocket from 'isomorphic-ws';
import { AutoReconnectWebSocket } from "./autoReconnectWebSocket";
import net from 'net';
import http from 'http';
import * as api from "./api";
import fetch from 'cross-fetch';

import { PairingIds } from "./pairingIds";
import { ParameterIds } from "./parameterIds";
import { Topics } from './topics';
import { ApiVirtualDevice } from './api/apiVirtualDevice';
import { ApiDevice } from './api/apiDevice';
import { ApiChannel } from './api/apiChannel';
import { ApiChannelIterator } from './api/apiChannelIterator';
import { WebsocketMessage } from './api';

export { PairingIds, ParameterIds, Topics };

export interface Datapoint {
    pairingID: PairingIds,
    value: string
}

export interface Parameter {
    parameterID: ParameterIds,
    value: string
}


export interface IndexedDatapoint {
    index: number,
    value: string
}

export { VirtualDeviceType } from './api';

export enum ConnectionStates {
    connecting,
    open,
    closing,
    closed,
    unknown,
}

interface ConnectionOptions {
    headers: Record<string, string | undefined> | undefined;
    baseUrl: string;
    fetch: any;
    createConnection: ((options: http.ClientRequestArgs, connectionListener?: (() => void) | undefined) => net.Socket) | undefined;
    agent: http.Agent;
}

const nativeIdRegExp = new RegExp("^[a-zA-Z0-9\-_]{1,64}$");

interface Events {
    open: FreeAtHomeApi,
    close: (code: number, reason: string) => void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type Emitter = StrictEventEmitter<EventEmitter, Events>;

export class FreeAtHomeApi extends (EventEmitter as { new(): Emitter }) {
    private connectionOptions: ConnectionOptions;
    websocket: AutoReconnectWebSocket;
    pingTimer: NodeJS.Timeout | undefined = undefined;
    pongReceived: boolean = true;

    virtualDevicesBySerial: Map<string, ApiVirtualDevice> = new Map();
    devicesBySerial: Map<string, ApiDevice> = new Map();

    deviceAddedEmitter: EventEmitter = new EventEmitter();

    enableLogging: boolean = false;

    constructor(baseUrl: string, authenticationHeader: object = {}) {
        super();

        const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;

        function connectToUnixSocket(options: http.ClientRequestArgs, connectionListener?: () => void) {
            return net.createConnection("/run/api/fhapi/v1", connectionListener);
        }

        const unixSocketAgent = new http.Agent(<object>{
            socketPath: "/run/api/fhapi/v1",
        });

        const tcpSocketAgent = new http.Agent(<object>{
            maxSockets: 4,
        });

        this.connectionOptions = {
            headers: {
                "Range": "0",
                ...authenticationHeader
            },
            baseUrl: (useUnixSocket) ? "http://localhost" : baseUrl,
            fetch: fetch,
            createConnection: (useUnixSocket) ? connectToUnixSocket : undefined, // used in EventSource
            agent: (useUnixSocket) ? unixSocketAgent : tcpSocketAgent          // used in fetch
        }

        this.websocket = new AutoReconnectWebSocket(baseUrl, "/api/ws", {
            ...authenticationHeader
        });
        this.websocket.on('message', this.parseWebsocketData.bind(this));

    }

    disconnect() {
        this.websocket.disconnect();
    }

    getConnectionState(): ConnectionStates {
        if (undefined === this.websocket.websocket)
            return ConnectionStates.closed;
        const state = this.websocket.websocket.readyState;
        switch (state) {
            case WebSocket.CONNECTING:
                return ConnectionStates.connecting;
            case WebSocket.OPEN:
                return ConnectionStates.open;
            case WebSocket.CLOSING:
                return ConnectionStates.closing;
            case WebSocket.CLOSED:
                return ConnectionStates.closed;
            default:
                return ConnectionStates.unknown;
        }
    }

    end() {
        this.websocket.disconnect();
    }

    private parseWebsocketData(data: WebSocket.Data) {
        const dataObject = <WebsocketMessage> JSON.parse(data as string);
        for (const sysApId in dataObject) {
            const datapoints = dataObject[sysApId].datapoints;
            for (const element in datapoints) {
                const value = datapoints[element];
                const pathElements = element.split("/");
                const deviceId = pathElements[0];

                const channel = parseInt(pathElements[1].substring(2), 16);

                const dataPointTypeAndIndex = pathElements[2];

                const dataPointTypeString = dataPointTypeAndIndex.substring(0, 3);

                const dataPointIndex = parseInt(dataPointTypeAndIndex.substring(3), 16);

                const datapointObject: IndexedDatapoint = {
                    index: dataPointIndex,
                    value: value,
                }

                const virtualDevice = this.virtualDevicesBySerial.get(deviceId);
                if (undefined !== virtualDevice) {
                    if (dataPointTypeString === "idp")
                        virtualDevice.onInputDatapointChange(channel, datapointObject);
                }

                const device = this.devicesBySerial.get(deviceId);
                if (undefined !== device) {
                    if (dataPointTypeString === "odp")
                        device.onOutputDatapointChange(channel, datapointObject);
                }
            }
            const devices = dataObject[sysApId].devices;
            for(const deviceId in devices) {
                const device = devices[deviceId];
                if( false == this.devicesBySerial.has(deviceId))
                {
                    const deviceObject = new ApiDevice(this, device, deviceId);
                    this.devicesBySerial.set(deviceId, deviceObject);
                }
                this.deviceAddedEmitter.emit(deviceId, device);
            }
            const scenesTriggered = dataObject[sysApId].scenesTriggered;
            for(const deviceId in scenesTriggered) {
                const device = scenesTriggered[deviceId];
                const channels = device.channels;
                for(const channelID in channels) {
                    const channel = parseInt(channelID.substring(2), 16);
                    const outputs = channels[channelID].outputs;
                    const virtualDevice = this.virtualDevicesBySerial.get(deviceId);
                    if (undefined !== virtualDevice) {
                            virtualDevice.onSceneTriggered(channel, Object.values(outputs));
                    }
                }
            }
        }
    }

    async setOutputDatapoint(serialNumber: string, channel: number, datapointIndex: number, value: string) {
        const channelString = channel.toString(16).padStart(6, "ch0000");
        const datapointString = datapointIndex.toString(16).padStart(7, "odp0000")


        const result = await api.putdatapoint(
            "00000000-0000-0000-0000-000000000000",
            serialNumber,
            channelString,
            datapointString,
            value,
            this.connectionOptions
        );
        if(this.enableLogging && result.status != 200) {
            console.error("Error in call to setOutputDatapoint status:", result.status);
        }
    }

    async setInputDatapoint(serialNumber: string, channel: number, datapointIndex: number, value: string) {
        const channelString = channel.toString(16).padStart(6, "ch0000");
        const datapointString = datapointIndex.toString(16).padStart(7, "idp0000")

        const result = await api.putdatapoint(
            "00000000-0000-0000-0000-000000000000",
            serialNumber,
            channelString,
            datapointString,
            value,
            this.connectionOptions
        );
        if (this.enableLogging && result.status != 200) {
            console.error("Error in call to setInputDatapoint status:", result.status);
        }
    }

    async setDeviceToUnresponsive(deviceType: api.VirtualDeviceType, nativeId: string, flavor?: string) {
        const res = await api.putApiRestVirtualdeviceBySysapAndSerial(
            "00000000-0000-0000-0000-000000000000",
            nativeId,
            {
                type: deviceType,
                properties: {
                    ttl: "0",
                    flavor: flavor
                }
            },
            this.connectionOptions
        );
        if (this.enableLogging && res.status != 200) {
            console.error("Could not set device to unresponsive: " + res.status);
        }
    }

    async setDeviceToResponsive(deviceType: api.VirtualDeviceType, nativeId: string, flavor?: string) {
        const res = await api.putApiRestVirtualdeviceBySysapAndSerial(
            "00000000-0000-0000-0000-000000000000",
            nativeId,
            {
                type: deviceType,
                properties: {
                    ttl: "180",
                    flavor: flavor
                }
            },
            this.connectionOptions
        );
        if (this.enableLogging && res.status != 200) {
            console.error("Could not set device to responsive: " + res.status);
        }
    }

    async createDevice(deviceType: api.VirtualDeviceType, nativeId: string, displayName: string, flavor?: string): Promise<ApiVirtualDevice> {
        if(false === nativeIdRegExp.test(nativeId))
            throw new Error("nativeId contains not supported characters");
        const res = await api.putApiRestVirtualdeviceBySysapAndSerial(
            "00000000-0000-0000-0000-000000000000",
            nativeId,
            {
                type: deviceType,
                properties: {
                    ttl: "180",
                    displayname: displayName,
                    flavor: flavor
                }
            },
            this.connectionOptions
        );
        if (res.status === 200) {
            const dataObject = res.data;
            for (const sysApId in dataObject) {
                const devices = dataObject[sysApId].devices;
                for (const deviceId in devices) {
                    const responseNativeId = devices[deviceId].serial;
                    if (responseNativeId === nativeId) {
                        console.log("Found device: " + deviceId);
                        return this.getCreatedDevice(deviceId, nativeId, deviceType, flavor);
                    }
                }
            }
            throw new Error("data in response not found");
        }
        else {
            throw new Error("Could not create virtual device error code: " + res.status);
        }
    }

    private async getCreatedDevice(deviceId: string, nativeId: string, deviceType: api.VirtualDeviceType, flavor?: string): Promise<ApiVirtualDevice> {
        const devicePromiseWithTimeout = new Response();
        const websocketDeviceAddedCallback = (device: api.Device) => {
            const deviceObject = this.addDevice(deviceId, nativeId, device, deviceType, flavor);
            devicePromiseWithTimeout.clearTimeout();
            this.deviceAddedEmitter.off(deviceId, websocketDeviceAddedCallback);
            devicePromiseWithTimeout.resolve(deviceObject);
        };
        devicePromiseWithTimeout.on("timeout", () => {
            devicePromiseWithTimeout.reject(new Error("timeout while waiting for device description from api"));
        });
        this.deviceAddedEmitter.on(deviceId, websocketDeviceAddedCallback);

        const deviceRequest = await api.getdevice(
            "00000000-0000-0000-0000-000000000000",
            deviceId,
            this.connectionOptions
        );
        if (deviceRequest.status === 200) {
            const device = deviceRequest.data?.["00000000-0000-0000-0000-000000000000"]?.devices?.[deviceId];
            if (device !== undefined) {
                if(undefined !== device.channels &&  0 == Object.keys(device.channels).length )
                    return await devicePromiseWithTimeout.promise;
                const deviceObject = this.addDevice(deviceId, nativeId, device, deviceType, flavor);
                devicePromiseWithTimeout.clearTimeout();
                this.deviceAddedEmitter.off(deviceId, websocketDeviceAddedCallback);
                return deviceObject;
            }
            else {
                throw new Error("device not found in response");
            }
        }
        else {
            return await devicePromiseWithTimeout.promise;
            // throw new Error("Could not read device from ata model error code: " + res.status);
        }
    }

    public async setAuxiliaryData(serialNumber: string, channel: number, index: number, auxiliaryData: string[]): Promise<void> {
        const channelString = channel.toString(16).padStart(6, "ch0000");
        await api.putAuxiliaryData(
            "00000000-0000-0000-0000-000000000000",
            serialNumber,
            channelString, index, auxiliaryData,
            this.connectionOptions);
    }

    private addDevice(deviceId: string, nativeId: string, apiDevice: api.Device, deviceType: api.VirtualDeviceType, flavor?: string): ApiVirtualDevice {
        const existingDevice = this.virtualDevicesBySerial.get(deviceId);
        if(undefined !== existingDevice)
            return existingDevice;
        const device = new ApiVirtualDevice(this, apiDevice, deviceId, nativeId, deviceType, flavor);
        this.virtualDevicesBySerial.set(deviceId, device);
        return device;
    }

    public async getDevice(deviceId: string) : Promise<api.Device> {
        let result: api.Device = {
            
        };
        const deviceRequest = await api.getdevice(
            "00000000-0000-0000-0000-000000000000",
            deviceId,
            this.connectionOptions
        );
        if (deviceRequest.status === 200) {
            const deviceObject = deviceRequest.data;
            for (const sysApId in deviceObject) {
                const device = deviceObject[sysApId].devices;
                for (const deviceId in device) {
                    result = device[deviceId];                    
                }
            }
        }
        else {
            throw new Error("Could not read configuration from data model. Error code: " + deviceRequest.status);
        }
        return result;
    }

    public async getAllDevices() : Promise<IterableIterator<ApiDevice>> {
        if(this.devicesBySerial.size !== 0) {
            return this.devicesBySerial.values();
        }
        const configurationRequest = await api.getconfiguration(this.connectionOptions);
        if (configurationRequest.status === 200) {
            const configurationObject = configurationRequest.data;
            for (const sysApId in configurationObject) {
                const devices = configurationObject[sysApId].devices;
                for (const deviceId in devices) {
                    if( false == this.devicesBySerial.has(deviceId))
                    {
                        const device = devices[deviceId];
                        const deviceObject = new ApiDevice(this, device, deviceId);
                        this.devicesBySerial.set(deviceId, deviceObject);
                    }
                }
            }
        }
        else {  
            throw new Error("Could not read configuration from data model. Error code: " + configurationRequest.status);
        }
        return this.devicesBySerial.values();
    }

    public async getAllChannels(): Promise<IterableIterator<ApiChannel>> {
        const devicesIterator = await this.getAllDevices();
        return new ApiChannelIterator(devicesIterator);
    }
}


export class Response extends EventEmitter {
    promise: Promise<ApiVirtualDevice>;

    resolve: (value: ApiVirtualDevice) => any = function (value: ApiVirtualDevice) { };
    reject: (reason: any) => any = function (reason: any) { };

    timeout: NodeJS.Timeout;

    constructor(timeout: number = 2 * 60 * 1_000) { // set timeout to two minutes
        super();
        this.timeout =  setTimeout(this.onTimeout.bind(this), timeout);
        this.promise = new Promise<ApiVirtualDevice>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    private onTimeout() {
        this.emit("timeout");
    }

    clearTimeout() {
        clearTimeout(this.timeout);
    }
}
