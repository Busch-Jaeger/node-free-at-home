import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import WebSocket from 'isomorphic-ws';
import { AutoReconnectWebSocket } from "./autoReconnectWebSocket";
import * as API from "./fhapi";

import { PairingIds } from "./pairingIds";
import { ParameterIds } from "./parameterIds";
import { Topics } from './topics';
import { Capabilities } from './capabilities';
import { ApiVirtualDevice } from './api/apiVirtualDevice';
import { ApiDevice } from './api/apiDevice';
import { ApiChannel } from './api/apiChannel';
import { ApiChannelIterator } from './api/apiChannelIterator';
import { handleRequestError } from './utilities';

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

export enum ConnectionStates {
    connecting,
    open,
    closing,
    closed,
    unknown,
}

const nativeIdRegExp = new RegExp("^[a-zA-Z0-9\-_]{1,64}$");
const websocketParameterRegExp = new RegExp("([0-9A-Z]{12})\/(?:ch([0-9A-Z]{4})\/)?par([0-9a-zA-Z]{4})");

interface Events {
    open: FreeAtHomeApi,
    close: (code: number, reason: string) => void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type Emitter = StrictEventEmitter<EventEmitter, Events>;

export class FreeAtHomeApi extends (EventEmitter as { new(): Emitter }) {
    private apiClient: API.FahClient;
    websocket: AutoReconnectWebSocket;
    pingTimer: NodeJS.Timeout | undefined = undefined;
    pongReceived: boolean = true;

    virtualDevicesBySerial: Map<string, ApiVirtualDevice> = new Map();
    devicesBySerial: Map<string, ApiDevice> = new Map();

    deviceAddedEmitter: EventEmitter = new EventEmitter();

    enableLogging: boolean = false;

    constructor(baseUrl: string, authenticationHeader: object = {}) {
        super();

        this.apiClient = new API.FahClient({
            BASE: baseUrl,
            HEADERS: authenticationHeader as Record<string, string>
        });

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
        const dataObject = <API.WebsocketMessage> JSON.parse(data as string);
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
                const virtualDevice = this.virtualDevicesBySerial.get(deviceId);
                if (undefined !== virtualDevice) {
                    virtualDevice.onDeviceChanged(device);
                }
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
            const parameters = dataObject[sysApId].parameters ?? {};
            for (const parameter in parameters) {
                const result = websocketParameterRegExp.exec(parameter)
                if (null === result)
                    break;
                const virtualDevice = this.virtualDevicesBySerial.get(result[1]);
                if (undefined === virtualDevice)
                    break;
                virtualDevice.onParameterChanged((result[2] !== undefined) ? parseInt(result[2], 16) : undefined, parseInt(result[3], 16) as ParameterIds, parameters[parameter]);
            }
        }
    }

    async setOutputDatapoint(serialNumber: string, channel: number, datapointIndex: number, value: string) {
        if(value === "") // work around for sysap not handling empty strings
            value = " ";

        const channelString = channel.toString(16).padStart(6, "ch0000");
        const datapointString = datapointIndex.toString(16).padStart(7, "odp0000")

        try {
            await this.apiClient.api.putdatapoint(
                "00000000-0000-0000-0000-000000000000",
                serialNumber,
                channelString,
                datapointString,
                value
            );
        } catch (e) {
            return Promise.reject(handleRequestError(e, this.enableLogging));
        }
    }

    async setInputDatapoint(serialNumber: string, channel: number, datapointIndex: number, value: string) {
        const channelString = channel.toString(16).padStart(6, "ch0000");
        const datapointString = datapointIndex.toString(16).padStart(7, "idp0000")

        try {
            await this.apiClient.api.putdatapoint(
                "00000000-0000-0000-0000-000000000000",
                serialNumber,
                channelString,
                datapointString,
                value
            );
        } catch (e) {
            return Promise.reject(handleRequestError(e, this.enableLogging));
        }
    }
    async setDeviceToUnresponsive(deviceType: API.VirtualDeviceType, nativeId: string, flavor?: string, capabilities?: Capabilities[]) {
        try {
            await this.apiClient.api.createVirtualDevice(
                "00000000-0000-0000-0000-000000000000",
                nativeId,
                {
                    type: deviceType,
                    properties: {
                        ttl: "0",
                        flavor: flavor,
                        capabilities: capabilities
                    }
                }
            );
        } catch (e) {
            handleRequestError(e, this.enableLogging);
            throw e;
        }        
    }

    async setDeviceToResponsive(deviceType: API.VirtualDeviceType, nativeId: string, flavor?: string, capabilities?: Capabilities[]) {
        try {
            await this.apiClient.api.createVirtualDevice(
                "00000000-0000-0000-0000-000000000000",
                nativeId,
                {
                    type: deviceType,
                    properties: {
                        ttl: "180",
                        flavor: flavor,
                        capabilities: capabilities
                    }
                }
            );
        } catch (e) {
            handleRequestError(e, this.enableLogging);
            throw e;
        }
    }

    async createDevice(deviceType: API.VirtualDeviceType, nativeId: string, displayName: string, flavor?: string, capabilities?: Capabilities[]): Promise<ApiVirtualDevice> {
        if(false === nativeIdRegExp.test(nativeId))
            throw new Error("nativeId contains not supported characters");
        try {
            const res : API.VirtualDevicesSuccess = await this.apiClient.api.createVirtualDevice(
                "00000000-0000-0000-0000-000000000000",
                nativeId,
                {
                    type: deviceType,
                    properties: {
                        ttl: "180",
                        displayname: displayName,
                        flavor: flavor,
                        capabilities: capabilities
                    }
                }
            );
            for (const sysApId in res) {
                const devices = res[sysApId].devices;
                for (const deviceId in devices) {
                    const responseNativeId = devices[deviceId].serial;
                    if (responseNativeId === nativeId) {
                        console.log("Found device: " + deviceId);
                        return this.getCreatedDevice(deviceId, nativeId, deviceType, flavor, capabilities);
                    }
                }
            }
            throw new Error("data in response not found");
        } catch (e) {
            throw new Error("Could not create virtual device " + deviceType +" error: " + (e as Error).message);
        }
    }

    private async getCreatedDevice(deviceId: string, nativeId: string, deviceType: API.VirtualDeviceType, flavor?: string, capabilities?: Capabilities[]): Promise<ApiVirtualDevice> {
        const devicePromiseWithTimeout = new Response();
        const websocketDeviceAddedCallback = (device: API.Device) => {
            const deviceObject = this.addDevice(deviceId, nativeId, device, deviceType, flavor, capabilities);
            devicePromiseWithTimeout.clearTimeout();
            this.deviceAddedEmitter.off(deviceId, websocketDeviceAddedCallback);
            devicePromiseWithTimeout.resolve(deviceObject);
        };
        devicePromiseWithTimeout.on("timeout", () => {
            devicePromiseWithTimeout.reject(new Error("timeout while waiting for device description from api"));
        });
        this.deviceAddedEmitter.on(deviceId, websocketDeviceAddedCallback);

        try {
            const deviceRequest = await this.apiClient.api.getdevice(
                "00000000-0000-0000-0000-000000000000",
                deviceId
            );
            const device = deviceRequest["00000000-0000-0000-0000-000000000000"]?.devices?.[deviceId];
            if (device !== undefined) {
                if(undefined !== device.channels &&  0 == Object.keys(device.channels).length )
                    return await devicePromiseWithTimeout.promise;
                const deviceObject = this.addDevice(deviceId, nativeId, device, deviceType, flavor, capabilities);
                devicePromiseWithTimeout.clearTimeout();
                this.deviceAddedEmitter.off(deviceId, websocketDeviceAddedCallback);
                return deviceObject;
            }
            else {
                throw new Error("device not found in response");
            }
        } catch (e) {
            return await devicePromiseWithTimeout.promise;
            // throw new Error("Could not read device from ata model error code: " + res.status);
        }
    }

    public async setAuxiliaryData(serialNumber: string, channel: number, index: number, auxiliaryData: string[]): Promise<void> {
        const channelString = channel.toString(16).padStart(6, "ch0000");
        try {
            await this.apiClient.api.putAuxiliaryData(
                "00000000-0000-0000-0000-000000000000",
                serialNumber,
                channelString, index, auxiliaryData);
        } catch(e) {
            return Promise.reject(handleRequestError(e, this.enableLogging));
        }
    }

    public async patch(serialNumber: string, patch: API.ApiRestDevice_sysap__serial_PatchRequest): Promise<void> {
        try {
            await this.apiClient.api.patchDevice("00000000-0000-0000-0000-000000000000", serialNumber, patch);        
        } catch(e) {
            handleRequestError(e, this.enableLogging);
        }
    }

    private addDevice(deviceId: string, nativeId: string, apiDevice: API.Device, deviceType: API.VirtualDeviceType, flavor?: string, capabilities?: Capabilities[]): ApiVirtualDevice {
        const existingDevice = this.virtualDevicesBySerial.get(deviceId);
        if(undefined !== existingDevice)
            return existingDevice;
        const device = new ApiVirtualDevice(this, apiDevice, deviceId, nativeId, deviceType, flavor, capabilities);
        this.virtualDevicesBySerial.set(deviceId, device);
        device.on("destroyed", () => {
            this.virtualDevicesBySerial.delete(deviceId);
        })
        return device;
    }

    public async getDevice(deviceId: string) : Promise<API.Device> {
        let result: API.Device = {};

        try {
            const deviceRequest = await this.apiClient.api.getdevice(
                "00000000-0000-0000-0000-000000000000",
                deviceId
            );

            for (const sysApId in deviceRequest) {
                const device = deviceRequest[sysApId].devices;
                for (const deviceId in device) {
                    result = device[deviceId];                    
                }
            }
        } catch (e) {
            handleRequestError(e, this.enableLogging);
        }
        
        return result;
    }

    public async getAllDevices() : Promise<IterableIterator<ApiDevice>> {
        if(this.devicesBySerial.size !== 0) {
            return this.devicesBySerial.values();
        }
        
        try {
            const configurationRequest = await this.apiClient.api.getconfiguration();
            for (const sysApId in configurationRequest) {
                const devices = configurationRequest[sysApId].devices;
                for (const deviceId in devices) {
                    if( false == this.devicesBySerial.has(deviceId))
                    {
                        const device = devices[deviceId];
                        const deviceObject = new ApiDevice(this, device, deviceId);
                        this.devicesBySerial.set(deviceId, deviceObject);
                    }
                }
            }
        } catch (e) {
            handleRequestError(e, this.enableLogging);
        }
        
        return this.devicesBySerial.values();
    }

    public async getAllChannels(): Promise<IterableIterator<ApiChannel>> {
        const devicesIterator = await this.getAllDevices();
        return new ApiChannelIterator(devicesIterator);
    }

    public async postNotification(notification: API.Notification) {
        return this.apiClient.api.postnotification(notification);
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
