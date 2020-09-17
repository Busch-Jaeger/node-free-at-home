import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../api";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FreeAtHomeApi, IndexedDatapoint } from '../freeAtHomeApi';
import { ApiDevice } from './apiDevice';
import { FunctionIds } from '../functionIds';

interface ChannelEvents {
    inputDatapointChanged(id: PairingIds, value: string): void,
    outputDatapointChanged(id: PairingIds, value: string): void,
    parameterChanged(id: ParameterIds, value: string): void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type ChannelEventEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class ApiChannel extends (EventEmitter as { new(): ChannelEventEmitter; }) {
    device: ApiDevice;
    channelNumber: number;

    inputPairingToPosition: Map<PairingIds, number> = new Map();
    inputPositionToPairing: Map<number, PairingIds> = new Map();
    outputPairingToPosition: Map<PairingIds, number> = new Map();
    outputPositionToPairing: Map<number, PairingIds> = new Map();

    floor: number | undefined = undefined;
    room: number | undefined = undefined;
    functionID: FunctionIds | undefined = undefined;

    constructor(device: ApiDevice, apiChannel: api.Channel, channelNumber: number) {
        super();
        this.device = device;
        this.channelNumber = channelNumber;

        if (apiChannel.floor !== undefined)
            this.floor = parseInt(apiChannel.floor, 16);
        if (apiChannel.room !== undefined)
            this.room = parseInt(apiChannel.room, 16);
        if (apiChannel.functionID !== undefined)
            this.functionID = <FunctionIds>parseInt(apiChannel.functionID, 16);

        { //inputs
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

        { //outputs
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

    onOutputDatapointChange(data: IndexedDatapoint) {
        const pairingId = this.outputPositionToPairing.get(data.index);
        if (undefined === pairingId)
            return;
        this.emit("outputDatapointChanged", pairingId, data.value);
    }

    public async setInputDatapoint(id: PairingIds, value: string) {
        const index = this.inputPairingToPosition.get(id);
        if (undefined === index)
            return;
        return this.device.setInputDatapoint(this.channelNumber, index, value);
    }
}
