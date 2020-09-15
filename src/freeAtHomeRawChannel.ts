import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { VirtualDeviceType } from '.';
import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    datapointChanged(id: PairingIds, value: string): void;
    parameterChanged(id: ParameterIds, value: string): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class FreeAtHomeRawChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, deviceType: VirtualDeviceType) {
        super(freeAtHome, channelNumber, serialNumber, name, deviceType);
    }

    public setOutputDatapoint(datapointId: PairingIds, value: string): void {
        this.setDatapoint(datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        // const { delegate } = this;
        console.log("datapoint changed %s %s", channel, id);
        this.emit("datapointChanged", id, value);
        // delegate.dataPointChanged(channel, id, value);
    }

    parameterChanged(id: ParameterIds, value: string): void {
        console.log("debug: %s %s", id, value);
        this.emit("parameterChanged", id, value);
    }
}