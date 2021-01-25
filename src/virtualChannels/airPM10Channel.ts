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

export class AirPM10Channel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }
    
    public setPM10(value: string): Promise<void>  {
        return this.setDatapoint(PairingIds.AL_INFO_PM_10, value);
    }

}