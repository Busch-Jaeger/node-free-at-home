import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    onSetPointTemperatureChanged(value: number): void;
    onDeviceEcoModeChanged(valueIsEco: boolean): void;
    onDeviceOnOffModeChanged(valueIsOn: boolean): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class RoomTemperatureControllerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    private setPointTemperature: number = 22.0;
    private HeatingOrCoolingMode: number = 0; //0 not active, 1 activeheat, 2 activecool

    constructor(channel: ApiVirtualChannel) {
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
        console.log("set datapoint:", PairingIds[id], value);
        switch (<PairingIds>id) {
            case PairingIds.AL_RELATIVE_SET_POINT_REQUEST: {
                const intValue = Number.parseFloat(value);
                this.setPointTemperature += intValue;
                if(this.isAutoConfirm)
                    this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));
                this.emit("onSetPointTemperatureChanged", this.setPointTemperature);
            }
                break;
            case PairingIds.AL_INFO_ABSOLUTE_SET_POINT_REQUEST: {
                const intValue = Number.parseFloat(value);
                this.setPointTemperature = intValue;
                if(this.isAutoConfirm)
                    this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));
                this.emit("onSetPointTemperatureChanged", this.setPointTemperature);
            }
                break;
            case PairingIds.AL_ECO_ON_OFF: {
                // this.setDatapoint(PairingIds.AL_ECO_ON_OFF, value);
                if("1" === value) {
                    this.setDatapoint(PairingIds.AL_STATE_INDICATION, "68");
                } else {
                    if (this.HeatingOrCoolingMode === 0) {
                        this.setDatapoint(PairingIds.AL_STATE_INDICATION, "65");
                    }
                    else if (this.HeatingOrCoolingMode === 1) {
                        this.setDatapoint(PairingIds.AL_STATE_INDICATION, "33");
                    }
                    else if (this.HeatingOrCoolingMode === 2) {
                        this.setDatapoint(PairingIds.AL_STATE_INDICATION, "1");
                    }
                }
                this.emit("onDeviceEcoModeChanged", "1" === value);
            }
                break;
            case PairingIds.AL_CONTROLLER_ON_OFF_REQUEST: {
                this.setDatapoint(PairingIds.AL_CONTROLLER_ON_OFF, value);
                this.emit("onDeviceOnOffModeChanged", "1" === value);
            }
                break;

        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    public async start(initialSetTemperature?: number) {
        await this.setDatapoint(PairingIds.AL_MEASURED_TEMPERATURE, "0");
        if (typeof initialSetTemperature !== 'undefined') {
            this.setPointTemperature = initialSetTemperature;

            await this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));
        }
        await this.setDatapoint(PairingIds.AL_RELATIVE_SET_POINT_TEMPERATURE, "0");
        await this.setDatapoint(PairingIds.AL_CONTROLLER_ON_OFF, "1");

        await this.setDatapoint(PairingIds.AL_STATE_INDICATION, "65");
    }

    public sendMeasuredTemperature(value: number) {
        this.setDatapoint(PairingIds.AL_MEASURED_TEMPERATURE, value.toFixed(1));
    }

    public sendSetPointTemperature(value: number) {
        this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, value.toFixed(1));
    }

    public getSetPointTemperature() {
        return this.setPointTemperature
    }

    public setEcoState(value: boolean) {
        this.dataPointChanged(PairingIds.AL_ECO_ON_OFF, value ? "1" : "0");
    }

    public setOnState(value: boolean) {
        this.dataPointChanged(PairingIds.AL_CONTROLLER_ON_OFF_REQUEST, value ? "1" : "0");
    }

    public setIsHeating(value: boolean) {
        if (value) {
            this.HeatingOrCoolingMode = 1;
            this.setDatapoint(PairingIds.AL_STATE_INDICATION, "33");
        } else {
            this.HeatingOrCoolingMode = 0;
            this.setDatapoint(PairingIds.AL_STATE_INDICATION, "65");
        }
    }

    public setIsCooling(value: boolean) {
        if (value) {
            this.HeatingOrCoolingMode = 2;
            this.setDatapoint(PairingIds.AL_STATE_INDICATION, "1");
        } else {
            this.HeatingOrCoolingMode = 0;
            this.setDatapoint(PairingIds.AL_STATE_INDICATION, "65");
        }
    }
}