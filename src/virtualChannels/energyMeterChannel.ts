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

export class EnergyMeterChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    public setSelfConsumption(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SELF_CONSUMPTION, value);
    }

    public setSelfSufficiency(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SELF_SUFFICIENCY, value);
    }

    public setHomePowerConsumption(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_HOME_POWER_CONSUMPTION, value);
    }
    
    public setPowerToGrid(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_POWER_TO_GRID, value);
    }
    
    public setConsumedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_CONSUMED_ENERGY_TODAY, value);
    }

    public setNotification(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_NOTIFICATION_METER_COMMUNICATION_ERROR_WARNING, value);
    }
}