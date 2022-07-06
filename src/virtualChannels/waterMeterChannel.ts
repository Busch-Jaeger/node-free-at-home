import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class WaterMeterChannel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    public setDatapoint(id: PairingIds, value: string): Promise<void> {
        return super.setDatapoint(id, value);
    }

    /**
     * @param value {String} unit l (DPT_VOLUME_LIQUID_LITRE)
     */
    public setWaterConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_WATER, value);
    }
    
    /**
     * @param value {String} unit l (DPT_VOLUME_LIQUID_LITRE)
     */
    public setWaterConsumedToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_CONSUMED_WATER_TODAY, value);
    }
}