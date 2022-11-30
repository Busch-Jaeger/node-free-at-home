import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';
import { Datapoint } from '..';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    setPointTemperatureChanged(value: number) : void;
    isOnChanged(value: boolean) : void;
    setModeAuto() : void;
    setModeCooling() : void;
    setModeHeating() : void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class SplitUnitChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    private setPointTemperature: number = 21.0;
    private swingOn = false;
    private isOn = false;
    private mode = 1; // AUTO
    private supportedFeatures = 7; // AUTO + HEATING + COOLING
    private remoteId = 0;

    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
        this.sendStatus();
        this.sendSupportedFeatures();
        this.setRemoteId(1);
    }

     /**
     * handle changes in incoming datapoints. Those events trigger a channel event.
     * @param id 
     * @param value 
     */
      protected dataPointChanged(id: PairingIds, value: string): void {
        console.log("set datapoint:", PairingIds[id], value);
        switch (<PairingIds>id) {
            case PairingIds.AL_RELATIVE_SET_POINT_REQUEST: {
                const intValue = Number.parseFloat(value);
                this.setPointTemperature += intValue;
                if(this.isAutoConfirm)
                    this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));
                this.emit("setPointTemperatureChanged", this.setPointTemperature);
            }
            break;
            case PairingIds.AL_INFO_ABSOLUTE_SET_POINT_REQUEST: {
                const intValue = Number.parseFloat(value);
                this.setPointTemperature = intValue;
                if(this.isAutoConfirm)
                    this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));
                this.emit("setPointTemperatureChanged", this.setPointTemperature);
            }
            break;

            case PairingIds.AL_CONTROLLER_ON_OFF_REQUEST:
                console.log('on', value, typeof value, 'current on:', this.isOn)
                this.setOn(value === "1");
                break;

            case PairingIds.AL_INFO_SWING_MODE:
                this.setSwingOn(value === "1");
                break;

            case PairingIds.AL_FAN_STAGE_REQUEST:
                if (this.isAutoConfirm) {
                    this.setDatapoint(PairingIds.AL_FAN_COIL_LEVEL, value);
                }
                break;
            case PairingIds.AL_INFO_OPERATION_MODE:
                if (this.isAutoConfirm) {
                    const intValue = Number.parseInt(value);
                    this.setMode(intValue);

                    switch (intValue) {
                        case 0:
                            this.emit("setModeAuto");
                            break;
                        case 0:
                            this.emit("setModeCooling");
                            break;
                        case 0:
                            this.emit("setModeHeating");
                            break;
                    }
                }
                break;
          }
      }

    public setDatapoint(id: PairingIds, value: string): Promise<void> {
        return super.setDatapoint(id, value);
    }

    setRemoteId(id: number) {
        if (this.remoteId !== id) {
            this.remoteId = id;
            this.sendSupportedFeatures();
        }
    }

    setOn(isOn: boolean) {
        if (this.isOn !== isOn) {
            this.isOn = isOn;
            this.sendStatus();
        }        
    }

    setSwingOn(swingOn: boolean) {
        if (this.swingOn !== swingOn) {
            this.swingOn = swingOn;
            this.sendStatus();
        }        
    }

    public setModeAuto() {
        this.setMode(1);
    }

    public setModeCooling() {
        this.setMode(2);
    }

    public setModeHeating() {
        this.setMode(3);
    }

    protected setMode(mode: number) {
        if (this.mode !== mode) {
            this.mode = mode;
            this.sendStatus()
        }
    }

    protected sendStatus() {
        let status = this.mode;
        if (this.isOn) {
            status |= 1 << 5;
        }
        if (this.swingOn) {
            status |= 1 << 6;
        }
        console.log('sending status:', status);
        this.setDatapoint(PairingIds.AL_EXTENDED_STATUS, status.toString());
    }

    protected sendSupportedFeatures() {
        let featuresMask = this.supportedFeatures
        // The id is encoded in bits 16-31. 
        featuresMask |= this.remoteId << 16;
        // only support auto mode
        this.setDatapoint(PairingIds.AL_SUPPORTED_FEATURES, featuresMask.toString());
    }

    public sendSetPointTemperature(value: number) {
        this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, value.toFixed(1));
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            const value = datapoint.value;
            switch (datapoint.pairingID) {
                case PairingIds.AL_SET_POINT_TEMPERATURE:
                    {
                        const intValue = Number.parseFloat(value);
                        this.setPointTemperature = intValue;
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));
                        this.emit("setPointTemperatureChanged", this.setPointTemperature);
                    }
                    break;
                case PairingIds.AL_STATE_INDICATION:
                    break;
                case PairingIds.AL_CONTROLLER_ON_OFF:
                    this.setOn(value === "1");
                    break;
                case PairingIds.AL_EXTENDED_STATUS:
                    {
                        const intValue = Number.parseInt(value) & 0xf;
                        if (this.isAutoConfirm)
                            this.setMode(intValue);

                        switch (intValue) {
                            case 0:
                                this.emit("setModeAuto");
                                break;
                            case 1:
                                this.emit("setModeCooling");
                                break;
                            case 2:
                                this.emit("setModeHeating");
                                break;
                        }
                    }
                    break;
            }
        }
    }
}