import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    onSetPointTemperatureChanged(value: number) : void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class RoomTemperatureControllerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    private setPointTemperature: number = 22.0;

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
                if("1" === value)
                    this.setDatapoint(PairingIds.AL_STATE_INDICATION, "68");
                else
                    this.setDatapoint(PairingIds.AL_STATE_INDICATION, "65");
            }
            break;
            case PairingIds.AL_CONTROLLER_ON_OFF_REQUEST: {
                this.setDatapoint(PairingIds.AL_CONTROLLER_ON_OFF, value);
            }
            break;

        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    public async start(initialSetTemperature: number) {
        this.setPointTemperature = initialSetTemperature;

        await this.setDatapoint(PairingIds.AL_MEASURED_TEMPERATURE, "22.5");

        await this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, this.setPointTemperature.toFixed(1));

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
}