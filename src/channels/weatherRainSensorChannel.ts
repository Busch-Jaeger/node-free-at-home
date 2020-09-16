import { PairingIds, ParameterIds, Device } from '../freeAtHomeApi';

import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class WeatherRainSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(device: Device, channelNumber: number){
        super(device, channelNumber);
        device.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    alertActivationLevel: number | undefined = undefined;


    setIsRaining(isRaining: boolean): void {
        const value = (true === isRaining) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_RAIN_ALARM, value);
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }
}
