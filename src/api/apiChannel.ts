import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../fhapi";
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

type OutputDatapointCallback = (value: string) => void;

export class ApiChannel extends (EventEmitter as { new(): ChannelEventEmitter; }) {
    device: ApiDevice;
    channelNumber: number;
    serialNumber: string;

    inputPairingToPosition: Map<PairingIds, number> = new Map();
    inputPositionToPairing: Map<number, PairingIds> = new Map();
    outputPairingToPosition: Map<PairingIds, number> = new Map();
    outputPositionToPairing: Map<number, PairingIds> = new Map();

    outputDataPoints: Map<PairingIds, string> = new Map();
    outputSubscribers: Map<PairingIds, OutputDatapointCallback[]> = new Map();

    floor: number | undefined = undefined;
    room: number | undefined = undefined;
    functionID: FunctionIds | undefined = undefined;

    displayName: string | undefined = undefined;

    constructor(device: ApiDevice, apiChannel: api.Channel, channelNumber: number) {
        super();
        this.device = device;
        this.channelNumber = channelNumber;
        this.serialNumber = `${device.serialNumber}/ch${channelNumber.toString().padStart(4, '0')}`;

        if (apiChannel.floor !== undefined)
            this.floor = parseInt(apiChannel.floor, 16);
        if (apiChannel.room !== undefined)
            this.room = parseInt(apiChannel.room, 16);
        if (apiChannel.functionID !== undefined)
            this.functionID = <FunctionIds>parseInt(apiChannel.functionID, 16);
        if (apiChannel.displayName !== undefined)
            this.displayName = apiChannel.displayName;

        { //inputs
            const inputs = apiChannel?.inputs;
            let i = 0;
            for (const input in inputs) {
                i = parseInt(input.substring(3), 16)
                if (isNaN(i)) {
                    console.error('error parsing index for', input);
                    continue;
                }
                const pairingId = inputs[input].pairingID;
                if (undefined === pairingId)
                    break;
                this.inputPairingToPosition.set(pairingId as PairingIds, i);
                this.inputPositionToPairing.set(i, pairingId as PairingIds);
            }
        }

        { //outputs
            const outputs = apiChannel?.outputs;
            let i = 0;
            for (const output in outputs) {
                i = parseInt(output.substring(3), 16)
                if (isNaN(i)) {
                    console.error('error parsing index for', output);
                    continue;
                }
                const pairingId = outputs[output].pairingID;
                if (undefined === pairingId)
                    break;
                this.outputPairingToPosition.set(pairingId as PairingIds, i);
                this.outputPositionToPairing.set(i, pairingId as PairingIds);

                const value = outputs[output].value;
                if(undefined !== value) {
                    this.outputDataPoints.set(pairingId, value);
                }
            }
        }
    }

    subscribeOutputDatapoint(outputDatapoint: PairingIds, callback: OutputDatapointCallback) {
        let subscribers = this.outputSubscribers.get(outputDatapoint);
        if(subscribers === undefined)
            subscribers = new Array();
        subscribers.push(callback);
        this.outputSubscribers.set(outputDatapoint, subscribers);
    };

    onOutputDatapointChange(data: IndexedDatapoint) {
        const pairingId = this.outputPositionToPairing.get(data.index);
        if (undefined === pairingId)
            return;
        this.outputDataPoints.set(pairingId, data.value);
        this.emit("outputDatapointChanged", pairingId, data.value);
        const subscribers = this.outputSubscribers.get(pairingId);
        if(subscribers !== undefined)
            subscribers.forEach( (callback) => {
                callback(data.value);
            });
    }

    public async setInputDatapoint(id: PairingIds, value: string) {
        const index = this.inputPairingToPosition.get(id);
        if (undefined === index)
            return;
        return this.device.setInputDatapoint(this.channelNumber, index, value);
    }
}
