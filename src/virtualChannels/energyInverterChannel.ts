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

export class EnergyInverterChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    
    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    public setSolarPowerProduction(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SOLAR_POWER_PRODUCTION, value);
    }
    
    public setInverterOutputPower(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INVERTER_OUTPUT_POWER, value);
    }

    public setSolarEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SOLAR_ENERGY_TODAY, value);
    }
    
}