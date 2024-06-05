import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../fhapi";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FunctionIds } from '../functionIds';
import { FreeAtHomeApi, IndexedDatapoint } from '../freeAtHomeApi';
import { ApiChannel } from './apiChannel';

interface DeviceEvents {
    outputDatapointChanged(id: PairingIds, value: string): void,
    parameterChanged(id: ParameterIds, value: string): void,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type DeviceEventEmitter = StrictEventEmitter<EventEmitter, DeviceEvents>;

export class ApiDevice extends (EventEmitter as { new(): DeviceEventEmitter; }) {
    freeAtHomeApi: FreeAtHomeApi;

    serialNumber: string;
    displayName: string | undefined;

    private channels: Map<number, ApiChannel> = new Map();

    constructor(freeAtHomeApi: FreeAtHomeApi, apiDevice: api.Device, serialNumber: string) {
        super();
        this.freeAtHomeApi = freeAtHomeApi;
        this.serialNumber = serialNumber;
        this.displayName = apiDevice.displayName;

        for (const channelName in apiDevice?.channels) {
            const apiChannel = apiDevice.channels?.[channelName];
            const i = parseInt(channelName.substring(2), 16);
            const channel = new ApiChannel(this, apiChannel, i);
            this.channels.set(i, channel);
        }
    }

    onOutputDatapointChange(channelId: number, data: IndexedDatapoint) {
        const channel = this.channels.get(channelId);
        channel?.onOutputDatapointChange(data);
    }

    public getChannels(): IterableIterator<ApiChannel> {
        return this.channels.values();
    }

    public getChannel(channelId: number)
    {
        return this.channels.get(channelId);
    }

    public setInputDatapoint(channelNumber: number, index: number, value: string): Promise<void> {
        return this.freeAtHomeApi.setInputDatapoint(this.serialNumber, channelNumber, index, value);
    }
}
