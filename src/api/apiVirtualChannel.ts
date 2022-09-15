import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../api";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FreeAtHomeApi, IndexedDatapoint } from '../freeAtHomeApi';
import { ApiVirtualDevice } from './apiVirtualDevice';
import { Datapoint } from '..';

interface ChannelEvents {
    inputDatapointChanged(id: PairingIds, value: string): void,
    outputDatapointChanged(id: PairingIds, value: string): void,
    parameterChanged(id: ParameterIds, value: string): void,
    sceneTriggered(scene: Datapoint[]): void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type ChannelEventEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class ApiVirtualChannel extends (EventEmitter as { new(): ChannelEventEmitter; }) {
    device: ApiVirtualDevice;
    channelNumber: number;
    serialNumber: string;

    inputPairingToPosition: Map<PairingIds, number> = new Map();
    inputPositionToPairing: Map<number, PairingIds> = new Map();
    outputPairingToPosition: Map<PairingIds, number> = new Map();
    outputPositionToPairing: Map<number, PairingIds> = new Map();

    constructor(device: ApiVirtualDevice, apiChannel: api.Channel, channelNumber: number) {
        super();
        this.device = device;
        this.channelNumber = channelNumber;
        this.serialNumber = `${device.serialNumber}/ch${channelNumber.toString().padStart(4, '0')}`;

        {
            const inputs = apiChannel?.inputs;
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
            const outputs = apiChannel?.outputs;
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

    onInputDatapointChange(data: IndexedDatapoint) {
        const pairingId = this.inputPositionToPairing.get(data.index);
        if (undefined === pairingId)
            return;
        this.emit("inputDatapointChanged", pairingId, data.value);
    }

    onSceneTriggered(data: Datapoint[]) {
        this.emit("sceneTriggered", data);
    }

    public async setUnresponsive(): Promise<void> {
        return this.device.setUnresponsive();
    }


    public async triggerKeepAlive(): Promise<void> {
        return this.device.triggerKeepAlive();
    }


    public async setOutputDatapoint(id: PairingIds, value: string): Promise<void> {    
        const index = this.outputPairingToPosition.get(id);
        if (undefined === index)
            throw new Error("Pairing id not found: " + id);
        return this.device.setOutputDatapoint(this.channelNumber, index, value);
    }

    public async setAuxiliaryData(index: number, auxiliaryData: string[]): Promise<void> {
        return this.device.setAuxiliaryData(this.channelNumber, index, auxiliaryData);
    }
}
