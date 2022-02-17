import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyInverterV2Channel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    /**
     * production PV / Total consumption
     * @param value {String} unit % (DPT_SCALING)
     */
    public setSelfConsumption(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SELF_CONSUMPTION, value);
    }

    /**
     * Consumption from PV / Total consumption
     * @param value {String} unit % (DPT_SCALING)
     */
    public setSelfSufficiency(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_SELF_SUFFICIENCY, value);
    }

    /**
     * Current power consumed. Although the Value is signed, an inverter never consumes power so
     * the value is always <= 0
     * @param value {String} unit W (DPT_VALUE_POWER)
     */
    public setCurrentPowerConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value);
    }
    
    /**
    * @param value {String} unit Wh (DPT_ACTIVE_ENERGY)
    */
    public setProvidedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_PROVIDED_ENERGY_TODAY, value);
    }

    /**
    * @param value {String} unit kWh (DPT_ACTIVE_ENERGY_KWH)
    */
    public setTotalEnergyProvided(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_PROVIDED, value);
    }

    
}