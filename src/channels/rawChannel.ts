import { PairingIds, ParameterIds, Device } from '../freeAtHomeApi';
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    datapointChanged(id: PairingIds, value: string): void;
    parameterChanged(id: ParameterIds, value: string): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class RawChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(device: Device, channelNumber: number){
        super(device, channelNumber);
        device.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    public setOutputDatapoint(datapointId: PairingIds, value: string): void {
        this.setDatapoint(datapointId, value);
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
        this.emit("datapointChanged", id, value);
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
        console.log("debug: %s %s", id, value);
        this.emit("parameterChanged", id, value);
    }
}