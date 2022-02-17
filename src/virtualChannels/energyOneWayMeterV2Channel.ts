import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyOneWayMeterV2Channel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    /**
     * Current power consumed. Although the value is signed, a one way meter does not measure injected power
     * and this value is always >= 0
     * @param value {String} unit W (DPT_VALUE_POWER)
     */
    public setCurrentPowerConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value);
    }
    
    /**
     * @param value {String} unit Wh (DPT_ACTIVE_ENERGY)
     */
    public setConsumedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CONSUMED_ENERGY_TODAY, value);
    }
    
    /**
    * @param value {String} unit kWh (DPT_ACTIVE_ENERGY_KWH)
    */
    public setTotalEnergyConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_CONSUMED, value);
    }
}