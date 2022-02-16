import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyBatteryV2Channel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    public setBatteryPower(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_BATTERY_POWER, value);
    }

    public setSoc(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SOC, value);
    }
    
    public setConsumedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CONSUMED_ENERGY_TODAY, value);
    }
    
    public setProvidedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_PROVIDED_ENERGY_TODAY, value);
    }
}