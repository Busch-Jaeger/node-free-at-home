import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyOneWayMeterV2Channel extends Channel {
    protected _supportsCostsExportTotal : boolean = false;
    protected _supportsCostsExportToday : boolean = false;

    constructor(channel: ApiVirtualChannel){
        super(channel);

        this._supportsCostsExportTotal = channel.outputPairingToPosition.has(PairingIds.AL_TOTAL_ENERGY_COST_EXPORTED);
        this._supportsCostsExportToday = channel.outputPairingToPosition.has(PairingIds.AL_EXPORTED_ENERGY_COST_TODAY);
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
    public setExportedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_EXPORTED_ENERGY_TODAY, value);
    }
    
    /**
    * @param value {String} unit kWh (DPT_ACTIVE_ENERGY_KWH)
    */
    public setTotalEnergyExported(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_EXPORTED, value);
    }

    /**
     * @param value {String} unit currency (DPT_VALUE_COST)
     */
    public setExportedEnergyCostsToday(value: string): Promise<void> {
        if (this._supportsCostsExportToday) {
            return this.setDatapoint(PairingIds.AL_EXPORTED_ENERGY_COST_TODAY, value);
        }
        return Promise.resolve();
    }

    /**
     * @param value {String} unit currency (DPT_VALUE_COST)
     */
    public setExportedEnergyCostsTotal(value: string): Promise<void> {
        if (this._supportsCostsExportTotal) {
            return this.setDatapoint(PairingIds.AL_TOTAL_ENERGY_COST_EXPORTED, value);
        }
        return Promise.resolve();
    }
}