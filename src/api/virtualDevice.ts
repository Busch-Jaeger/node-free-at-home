import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../api";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FreeAtHomeApi, IndexedDatapoint } from '../freeAtHomeApi';

interface DeviceEvents {
    inputDatapointChanged(id: PairingIds, value: string): void,
    outputDatapointChanged(id: PairingIds, value: string): void,
    parameterChanged(id: ParameterIds, value: string): void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type DeviceEventEmitter = StrictEventEmitter<EventEmitter, DeviceEvents>;

export class VirtualDevice extends (EventEmitter as { new(): DeviceEventEmitter; }) {
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
