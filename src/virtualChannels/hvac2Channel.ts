import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';
import { Datapoint } from '..';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    isOnChanged(value: boolean): void;
    awayChanged(value: string): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class HVAC2Channel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    protected _supportsCurrentPower: boolean = false;
    protected _supportsEnergyTotal: boolean = false;
    protected _supportsEnergyToday: boolean = false;

    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));

        this._supportsCurrentPower = channel.outputPairingToPosition.has(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED);
        this._supportsEnergyTotal = channel.outputPairingToPosition.has(PairingIds.AL_MEASURED_TOTAL_ENERGY_EXPORTED);
        this._supportsEnergyToday = channel.outputPairingToPosition.has(PairingIds.AL_MEASURED_EXPORTED_ENERGY_TODAY);
    }

     /**
     * handle changes in incoming datapoints. Those events trigger a channel event.
     * @param id 
     * @param value 
     */
      protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {
            case PairingIds.AL_SWITCH_ON_OFF:
                this.emit("isOnChanged", value == "1");
                if (this.isAutoConfirm)
                    this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                break
            
             case PairingIds.AL_AWAY:
                 this.emit("awayChanged", value)
                 break            
        }
    }

    get supportsCurrentPower() {
        return this._supportsCurrentPower;
    }

    get supportsEnergyTotal() {
        return this._supportsEnergyTotal;
    }

    get supportsEnergyToday() {
        return this._supportsEnergyToday;
    }

    setOn(isOn: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, (isOn) ? "1" : "0");
    }

    /**
     * Current power consumed. Although the value is signed, a one way meter does not measure injected power
     * and this value is always >= 0
     * @param value {number} unit W (DPT_VALUE_POWER)
     */
    public setCurrentPowerConsumed(value: number): Promise<void> {
        if (this._supportsCurrentPower) {
            return this.setDatapoint(PairingIds.AL_MEASURED_CURRENT_POWER_CONSUMED, value.toString(10));
        }
        return Promise.resolve();
    }
    
    /**
     * @param value {number} unit Wh (DPT_ACTIVE_ENERGY)
     */
    public setExportedEnergyToday(value: number): Promise<void> {
        if (this._supportsEnergyToday) {
            return this.setDatapoint(PairingIds.AL_MEASURED_EXPORTED_ENERGY_TODAY, value.toString(10));
        }
        return Promise.resolve();
    }
    
    /**
    * @param value {number} unit kWh (DPT_ACTIVE_ENERGY_KWH)
    */
    public setTotalEnergyExported(value: number): Promise<void> {
        if (this._supportsEnergyTotal) {
            return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_EXPORTED, value.toString(10));
        }
        return Promise.resolve();
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            switch (datapoint.pairingID) {
                case PairingIds.AL_INFO_ON_OFF:
                    this.emit("isOnChanged", ("1" === datapoint.value));
                    if (this.isAutoConfirm)
                        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, datapoint.value);
                    break;
            }
        }
    }
}