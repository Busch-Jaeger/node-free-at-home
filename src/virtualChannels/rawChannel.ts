import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
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
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
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