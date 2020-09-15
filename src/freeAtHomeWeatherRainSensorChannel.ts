import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';

import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class freeAtHomeWeatherRainSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "Weather-RainSensor");
    }

    alertActivationLevel: number | undefined = undefined;


    setIsRaining(isRaining: boolean): void {
        const { freeAtHome } = this;
        const value = (true === isRaining) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_RAIN_ALARM, value);
    }

    setDatapoint(datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber, freeAtHome } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {
    }
}
