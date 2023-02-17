import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';

export class EnergyBatteryV2Channel extends Channel {
    protected _supportsSoc: boolean = false;

    constructor(channel: ApiVirtualChannel){
        super(channel);
        this._supportsSoc = channel.outputPairingToPosition.has(PairingIds.AL_SOC);
    }

    get supportsSoc() {
        return this._supportsSoc;
    }
    
    public setDatapoint(id: PairingIds, value: string): Promise<void> {
        return super.setDatapoint(id, value);
    }

    /**
    * Battery power: Discharge (less then 0), Charge (more then 0)
    * @param value {String} unit kW (DPT_POWER)
    */
    public setBatteryPower(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_BATTERY_POWER, value);
    }

    /**
     * Current loading state of the battery in percent.
     * @param value {String} unit % (DPT_SCALING)
     */
    public setSoc(value: string): Promise<void> {
        if (this._supportsSoc) {
            return this.setDatapoint(PairingIds.AL_SOC, value);
        }
        return Promise.resolve();
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
}