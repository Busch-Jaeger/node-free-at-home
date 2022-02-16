import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyTwoWayMeterV2Channel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    public setCurrentPowerConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value);
    }
    
    public setConsumedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CONSUMED_ENERGY_TODAY, value);
    }
    
    public setProvidedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_PROVIDED_ENERGY_TODAY, value);
    }

    public setTotalEnergyConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_CONSUMED, value);
    }

    public setTotalEnergyProvided(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_PROVIDED, value);
    }
}