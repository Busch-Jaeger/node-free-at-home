import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import WebSocket from 'ws';
import * as api from "./api";
import nodeFetch from "node-fetch";

import { PairingIds } from "./pairingIds";
import { ParameterIds } from "./parameterIds";

export { PairingIds, ParameterIds };

export interface Datapoint {
    pairingId: PairingIds,
    value: string
}

export interface Parameter {
    parameterId: ParameterIds,
    value: string
}


interface IndexedDatapoint {
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

interface Events {
    open: FreeAtHomeApi,
    close: (code: number, reason: string) => void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type MyEmitter = StrictEventEmitter<EventEmitter, Events>;

interface DeviceEvents {
    inputDatapointChanged(id: PairingIds, value: string): void,
    outputDatapointChanged(id: PairingIds, value: string): void,
    parameterChanged(id: ParameterIds, value: string): void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type DeviceEventEmitter = StrictEventEmitter<EventEmitter, DeviceEvents>;


export class Device extends (EventEmitter as { new(): DeviceEventEmitter }) {
    freeAtHomeApi: FreeAtHomeApi;

    inputPairingToPosition: Map<PairingIds, number> = new Map();
    inputPositionToPairing: Map<number, PairingIds> = new Map();
    outputPairingToPosition: Map<PairingIds, number> = new Map();
    outputPositionToPairing: Map<number, PairingIds> = new Map();

    nativeId: string;
    serialNumber: string;
    deviceType: api.VirtualDeviceType;

    constructor(freeAtHomeApi: FreeAtHomeApi, apiDevice: api.Device, serialNumber: string, deviceType: api.VirtualDeviceType) {
        super();
        this.freeAtHomeApi = freeAtHomeApi;
        this.nativeId = apiDevice.nativeId || "";
        this.serialNumber = serialNumber;
        this.deviceType = deviceType;

        const channel = apiDevice.channels?.["ch0000"];
        {
            const inputs = channel?.inputs;
            let i = 0;
            for (const input in inputs) {
                const pairingId = inputs[input].pairingID;
                if (undefined === pairingId)
                    break;
                this.inputPairingToPosition.set(pairingId as PairingIds, i);
                this.inputPositionToPairing.set(i, pairingId as PairingIds);
                i++;
            }
        }

        {
            const outputs = channel?.outputs;
            let i = 0;
            for (const output in outputs) {
                const pairingId = outputs[output].pairingID;
                if (undefined === pairingId)
                    break;
                this.outputPairingToPosition.set(pairingId as PairingIds, i);
                this.outputPositionToPairing.set(i, pairingId as PairingIds);
                i++;
            }
        }
    }

    onInputDatapointChange(channel: number, data: IndexedDatapoint) {
        const pairingId = this.inputPositionToPairing.get(data.index);
        if (undefined === pairingId)
            return;
        this.emit("inputDatapointChanged", pairingId, data.value);
    }

    onOutputDatapointChange(data: IndexedDatapoint) {
        const pairingId = this.outputPositionToPairing.get(data.index);
        if (undefined === pairingId)
            return;
        this.emit("outputDatapointChanged", pairingId, data.value);
    }

    public setUnresponsive() {
        this.freeAtHomeApi.setDeviceToUnresponsive(this.deviceType, this.nativeId);
    }

    public triggerKeepAlive() {
        this.freeAtHomeApi.setDeviceToResponsive(this.deviceType, this.nativeId);
    }

    public setOutputDatapoint(channelNumber: number, id: PairingIds, value: string) {
        this.freeAtHomeApi.setOutputDatapoint(this.serialNumber, channelNumber, id, value);
    }
}

export class FreeAtHomeApi extends (EventEmitter as { new(): MyEmitter }) {
    websocketBaseUrl: string;
    authenticationHeader: object;
    websocket: WebSocket | undefined = undefined;
    pingTimer: NodeJS.Timeout;

    devicesBySerial: Map<string, Device> = new Map();

    constructor(baseUrl: string, authenticationHeader: object = {}) {
        super();

        this.websocketBaseUrl = baseUrl.replace(/^(http)/, "ws");
        this.authenticationHeader = authenticationHeader;

        api.defaults.baseUrl = baseUrl;

        api.defaults.headers = {
            ...authenticationHeader
        };

        api.defaults.fetch = nodeFetch;

        this.connectWebsocket();

        this.pingTimer = setInterval(() => {
            if (this.websocket !== undefined && this.websocket.OPEN == this.websocket.readyState) {
                this.websocket.ping();
            }
        }, 5000);
    }

    private connectWebsocket() {
        try {
            this.websocket = new WebSocket(this.websocketBaseUrl + "/api/ws", {
                rejectUnauthorized: false,
                headers: {
                    ...this.authenticationHeader
                }
            });

            this.websocket.on('open', this.onOpen.bind(this));
            this.websocket.on('close', this.onClose.bind(this));
            this.websocket.on('error', this.onError.bind(this));

            this.websocket.on('message', this.parseWebsocketData.bind(this));
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
        clearInterval(this.pingTimer);
        if (undefined !== this.websocket) {
            this.websocket.removeAllListeners('close');
            this.websocket.close();
        }
    }

    getConnectionState(): ConnectionStates {
        if (undefined === this.websocket)
            return ConnectionStates.closed;
        const state = this.websocket.readyState;
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

    private onOpen() {
        this.emit("open", this);
    }

    private onClose(code: number, reason: string) {
        console.log("try to reconnect in 10 seconds...");
        setTimeout(
            () => {
                console.log("reconnecting...");
                this.connectWebsocket();
            }, 10000);
        this.emit('close', code, reason);
    }

    private onError(err: Error) {
        console.error('❌', err.toString())
    }

    end() {
        if (undefined !== this.websocket) {
            this.websocket.removeAllListeners();
            this.websocket.close();
        }
    }

    private parseWebsocketData(data: WebSocket.Data) {
        const dataObject = JSON.parse(data as string);
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

                const device = this.devicesBySerial.get(deviceId);
                if (undefined !== device) {
                    if (dataPointTypeString === "idp")
                        device.onInputDatapointChange(channel, datapointObject);
                    else if (dataPointTypeString === "odp")
                        device.onInputDatapointChange(channel, datapointObject);
                }
            }
        }
    }

    setOutputDatapoint(serialNumber: string, channel: number, pairingId: number, value: string) {
        const device = this.devicesBySerial.get(serialNumber);
        if (undefined !== device) {
            const channelString = channel.toString(16).padStart(6, "ch0000");
            const outputPosition = device.outputPairingToPosition.get(pairingId);
            if (undefined === outputPosition)
                return;
            const datapointString = outputPosition.toString(16).padStart(7, "odp0000")

            channelString + "." + datapointString;
            api.putdatapoint(
                "00000000-0000-0000-0000-000000000000",
                device.serialNumber + "." + channelString + "." + datapointString,
                value
            );
        }
    }

    async setDeviceToUnresponsive(deviceType: api.VirtualDeviceType, nativeId: string) {
        const res = await api.putApiRestVirtualdeviceBySysapAndSerial(
            "00000000-0000-0000-0000-000000000000",
            nativeId,
            {
                type: deviceType,
                properties: {
                    ttl: "0",
                }
            }
        );
    }

    async setDeviceToResponsive(deviceType: api.VirtualDeviceType, nativeId: string) {
        const res = await api.putApiRestVirtualdeviceBySysapAndSerial(
            "00000000-0000-0000-0000-000000000000",
            nativeId,
            {
                type: deviceType,
                properties: {
                    ttl: "180",
                }
            }
        );
    }

    async createDevice(deviceType: api.VirtualDeviceType, nativeId: string, displayName: string): Promise<Device> {
        const res = await api.putApiRestVirtualdeviceBySysapAndSerial(
            "00000000-0000-0000-0000-000000000000",
            nativeId,
            {
                type: deviceType,
                properties: {
                    ttl: "180",
                    displayname: displayName
                }
            }
        );
        if (res.status === 200) {
            const dataObject = res.data;
            for (const sysApId in dataObject) {
                const devices = dataObject[sysApId].devices;
                for (const deviceId in devices) {
                    const responseNativeId = devices[deviceId].serial;
                    if (responseNativeId === nativeId) {
                        console.log("Found device: " + deviceId);
                        const deviceRequest = await api.getdevice(
                            "00000000-0000-0000-0000-000000000000",
                            deviceId
                        );
                        if (deviceRequest.status === 200) {
                            const device = deviceRequest.data?.["00000000-0000-0000-0000-000000000000"]?.devices?.[deviceId];
                            if (device !== undefined) {
                                const deviceObject = this.addDevice(deviceId, nativeId, device, deviceType);
                                return deviceObject;
                            }
                            else {
                                throw new Error("device not found in response");
                            }
                        }
                        else {
                            throw new Error("Could not read device from ata model error code: " + res.status);
                        }
                    }
                }
            }
            throw new Error("data in response not found");
        }
        else {
            throw new Error("Could not create virtual device error code: " + res.status);
        }
    }

    private addDevice(deviceId: string, nativeId: string, apiDevice: api.Device, deviceType: api.VirtualDeviceType): Device {
        const device = new Device(this, apiDevice, deviceId, deviceType);
        this.devicesBySerial.set(deviceId, device);
        return device;
    }

}

