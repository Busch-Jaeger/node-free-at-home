import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyInverterV2Channel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    public setSelfConsumption(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SELF_CONSUMPTION, value);
    }

    public setSelfSufficiency(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SELF_SUFFICIENCY, value);
    }

    public setCurrentPowerConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value);
    }
    
    public setProvidedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_PROVIDED_ENERGY_TODAY, value);
    }

    public setTotalEnergyProvided(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_PROVIDED, value);
    }

    
}