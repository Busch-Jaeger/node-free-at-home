import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { Datapoint } from '..';

interface ChannelEvents {
    
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class MeterSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel) {
        super(channel);
    }

    setCurrentConsumedPower(value: Number): void {
        this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value.toFixed(3));
    }

}