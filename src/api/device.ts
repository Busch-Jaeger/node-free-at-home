import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../api";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FreeAtHomeApi, IndexedDatapoint } from '../freeAtHomeApi';

interface DeviceEvents {
    outputDatapointChanged(id: PairingIds, value: string): void,
    parameterChanged(id: ParameterIds, value: string): void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type DeviceEventEmitter = StrictEventEmitter<EventEmitter, DeviceEvents>;

export class Device extends (EventEmitter as { new(): DeviceEventEmitter; }) {
    freeAtHomeApi: FreeAtHomeApi;

    outputPairingToPosition: Map<PairingIds, number> = new Map();
    outputPositionToPairing: Map<number, PairingIds> = new Map();

    serialNumber: string;

    constructor(freeAtHomeApi: FreeAtHomeApi, apiDevice: api.Device, serialNumber: string) {
        super();
        this.freeAtHomeApi = freeAtHomeApi;
        this.serialNumber = serialNumber;

        const channel = apiDevice.channels?.["ch0000"];
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

    onOutputDatapointChange(channel: number, data: IndexedDatapoint) {
        const pairingId = this.outputPositionToPairing.get(data.index);
        if (undefined === pairingId)
            return;
        this.emit("outputDatapointChanged", pairingId, data.value);
    }

    public setInputDatapoint(channelNumber: number, id: PairingIds, value: string) {
        this.freeAtHomeApi.setInputDatapoint(this.serialNumber, channelNumber, id, value);
    }
}
