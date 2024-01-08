import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyTwoWayMeterV2Channel extends Channel {
    protected _supportsCostsImportTotal : boolean = false;
    protected _supportsCostsExportTotal : boolean = false;
    protected _supportsCostsImportToday : boolean = false;
    protected _supportsCostsExportToday : boolean = false;

    constructor(channel: ApiVirtualChannel){
        super(channel);

        this._supportsCostsImportTotal = channel.outputPairingToPosition.has(PairingIds.AL_TOTAL_ENERGY_COST_IMPORTED);
        this._supportsCostsExportTotal = channel.outputPairingToPosition.has(PairingIds.AL_TOTAL_ENERGY_COST_EXPORTED);
        this._supportsCostsImportToday = channel.outputPairingToPosition.has(PairingIds.AL_IMPORTED_ENERGY_COST_TODAY);
        this._supportsCostsExportToday = channel.outputPairingToPosition.has(PairingIds.AL_EXPORTED_ENERGY_COST_TODAY);
    }
    
    /**
     * Current power consumed. Value is signed, > 0 means power consumed, < 0: power injected
     * @param value {String} unit W (DPT_VALUE_POWER)
     */
    public setCurrentPowerConsumed(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value);
    }

    /**
     * Currently available excess power (value is unsigned)
     * @param value {String} unit W (DPT_VALUE_POWER)
     */
    public setCurrentExcessPower(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_EXCESS_POWER, value);
    }
    
    /**
     * @param value {String} unit Wh (DPT_ACTIVE_ENERGY)
     */
    public setImportedEnergyToday(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_IMPORTED_ENERGY_TODAY, value);
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
    public setTotalEnergyImported(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_IMPORTED, value);
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
    public setImportedEnergyCostsToday(value: string): Promise<void> {
        if (this._supportsCostsImportToday) {
            return this.setDatapoint(PairingIds.AL_IMPORTED_ENERGY_COST_TODAY, value);
        }
        return Promise.resolve();
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
     public setImportedEnergyCostsTotal(value: string): Promise<void> {
        if (this._supportsCostsImportTotal) {
            return this.setDatapoint(PairingIds.AL_TOTAL_ENERGY_COST_IMPORTED, value);
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