import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class GasMeterChannel extends Channel {
    constructor(channel: ApiVirtualChannel){
        super(channel);
    }

    public setDatapoint(id: PairingIds, value: string): Promise<void> {
        return super.setDatapoint(id, value);
    }

    /**
     * @param value {String} unit m³ (DPT_VOLUME_M3)
     */
    public setGasConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_GAS, value);
    }
    
    /**
     * @param value {String} unit m³ (DPT_VOLUME_M3)
     */
    public setGasConsumedToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_CONSUMED_GAS_TODAY, value);
    }
}