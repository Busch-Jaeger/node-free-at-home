import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import WebSocket from 'ws';
import * as api from "./api";
import nodeFetch from "node-fetch";

import { PairingIds } from "./pairingIds";
import { ParameterIds } from "./parameterIds";

export { PairingIds, ParameterIds };

interface Packet {
    type: string,
    name: string,
    payload: Datapoint | Parameter | CreateDevice,
}

export interface Datapoint {
    nativeId: string,
    channelId: number,
    pairingId: PairingIds,
    value: string
}

export interface Parameter {
    nativeId: string,
    parameterId: ParameterIds,
    value: string
}

interface CreateDevice {
    nativeId: string,
    deviceType: api.VirtualDevice,
    displayName: string
}

interface DatapointObject {
    device: string;
    channel: number;
    dataPoint: number;
    datapointType: "input" | "output" | undefined;
    value: any;
    sysapId: string;
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
    dataPointChanged: Datapoint,
    parameterChanged: Parameter,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type MyEmitter = StrictEventEmitter<EventEmitter, Events>;

class Device extends EventEmitter {
    inputPairingToPosition: Map<PairingIds, number> = new Map();
    inputPositionToPairing: Map<number, PairingIds> = new Map();
    outputPairingToPosition: Map<PairingIds, number> = new Map();
    outputPositionToPairing: Map<number, PairingIds> = new Map();

    nativeId: string;
    serialNumber: string;
    deviceType: api.VirtualDeviceType;

    constructor(apiDevice: api.Device, serialNumber: string, deviceType: api.VirtualDeviceType) {
        super();

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

    onDatapointChange(data: DatapointObject) {
        if ("input" === data.datapointType) {
            const pairingId = this.inputPositionToPairing.get(data.dataPoint);
            if (undefined === pairingId)
                return;
            const datapoint: Datapoint = {
                nativeId: this.nativeId,
                channelId: data.channel,
                pairingId: pairingId,
                value: data.value,
            }
            this.emit("datapointChanged", datapoint);
        }
    }
}

export class FreeAtHomeApi extends (EventEmitter as { new(): MyEmitter }) {
    websocket: WebSocket;
    pingTimer: NodeJS.Timeout;
    watchdogTimer: NodeJS.Timeout;

    devicesBySerial: Map<string, Device> = new Map();
    devicesByNativeId: Map<string, Device> = new Map();

    constructor(baseUrl: string, authentificationHeader: object = {}) {
        super();


        api.defaults.baseUrl = baseUrl

        api.defaults.headers = {
            ...authentificationHeader
        };

        api.defaults.fetch = nodeFetch;

        const websocketBaseUrl = baseUrl.replace(/^(http)/, "ws");
        this.websocket = new WebSocket(websocketBaseUrl + "/api/ws", {
            rejectUnauthorized: false,
            headers: {
                ...authentificationHeader
            }
        });

        this.websocket.on('open', this.onOpen.bind(this));
        this.websocket.on('close', this.onClose.bind(this));
        this.websocket.on('error', this.onError.bind(this));

        this.websocket.on('message', this.parseWebsocketData.bind(this));

        this.pingTimer = setInterval(() => {
            if (this.websocket.OPEN == this.websocket.readyState) {
                this.websocket.ping();
            }
        }, 5000);

        this.watchdogTimer = setInterval(this.onWatchdogTimer.bind(this), 1000 * 120);
    }

    disconnect() {
        clearInterval(this.pingTimer);
        this.websocket.removeAllListeners('close');
        this.websocket.close();
    }

    getConnectionState(): ConnectionStates {
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

    onOpen() {
        this.emit("open", this);
    }

    onClose(code: number, reason: string) {
        this.emit('close', code, reason);
    }

    onError(err: Error) {
        console.error('❌', err.toString())
    }

    end() {
        this.websocket.removeAllListeners();
        this.websocket.close();
    }

    parseWebsocketData(data: WebSocket.Data) {
        const dataObject = JSON.parse(data as string);
        for (const sysApId in dataObject) {
            const datapoints = dataObject[sysApId].datapoints;
            for (const element in datapoints) {
                const value = datapoints[element];
                const pathElements = element.split("/");
                const deviceId = pathElements[0];

                const channel = parseInt(pathElements[1].substring(2), 16);

                const datapoint = pathElements[2];

                const dataPointTypeString = datapoint.substring(0, 3);
                const dataPointType =
                    (dataPointTypeString === "idp") ? "input" :
                        (dataPointTypeString === "odp") ? "output" :
                            undefined;


                const dataPoint = parseInt(datapoint.substring(3), 16);

                const datapointObject: DatapointObject = {
                    device: deviceId,
                    channel: channel,
                    dataPoint: dataPoint,
                    datapointType: dataPointType,
                    value: value,
                    sysapId: sysApId,
                }

                const device = this.devicesBySerial.get(deviceId);
                if (undefined !== device) {
                    device.onDatapointChange(datapointObject);
                }
            }
        }
    }

    setDatapoint(nativeId: string, channel: number, pairingId: number, value: string) {
        const device = this.devicesByNativeId.get(nativeId);
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

    async createDevice(deviceType: api.VirtualDeviceType, nativeId: string, displayName: string) {
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
            console.log(dataObject);
            for (const sysApId in dataObject) {
                const devices = dataObject[sysApId].devices;
                for (const deviceId in devices) {
                    const responseNativeId = devices[deviceId].serial;
                    if (responseNativeId === nativeId) {
                        console.log("Found: " + deviceId);
                        const deviceRequest = await api.getdevice(
                            "00000000-0000-0000-0000-000000000000",
                            deviceId
                        );
                        if (deviceRequest.status === 200) {
                            const device = deviceRequest.data?.["00000000-0000-0000-0000-000000000000"]?.devices?.[deviceId];
                            console.log(device);
                            if (device !== undefined) {
                                this.addDevice(deviceId, nativeId, device, deviceType);
                            }
                            else {
                                //error
                            }
                        }
                    }
                }
            }
        }
    }

    private onDatapointChanged(datapoint: Datapoint) {
        this.emit("dataPointChanged", datapoint);
    }

    private addDevice(deviceId: string, nativeId: string, apiDevice: api.Device, deviceType: api.VirtualDeviceType) {
        const device = new Device(apiDevice, deviceId, deviceType);
        this.devicesBySerial.set(deviceId, device);
        this.devicesByNativeId.set(nativeId, device);
        device.on('datapointChanged', this.onDatapointChanged.bind(this))
    }



    private async onWatchdogTimer() {
        for (const deviceId in this.devicesBySerial) {
            const device = this.devicesBySerial.get(deviceId);
            if (undefined === device)
                return;
            await api.putApiRestVirtualdeviceBySysapAndSerial(
                "00000000-0000-0000-0000-000000000000",
                device.nativeId,
                {
                    type: device.deviceType,
                    properties: {
                        ttl: "180"
                    }
                }
            );
        }
    }

}

