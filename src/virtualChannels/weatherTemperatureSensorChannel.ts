import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";

import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class WeatherTemperatureSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    alertActivationLevel: number | undefined = undefined;

    setTemperature(temperature: number): void {
        this.setDatapoint(PairingIds.AL_OUTDOOR_TEMPERATURE, <string><unknown>temperature);
        console.log("new temperature %s", temperature);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel < temperature)
                this.setDatapoint(PairingIds.AL_FROST_ALARM, "0");
            else
                this.setDatapoint(PairingIds.AL_FROST_ALARM, "1");
        }
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {

        switch (id) {
            case ParameterIds.PID_FROST_ALARM_ACTIVATION_LEVEL:
                this.alertActivationLevel = <number>parseInt(value);
                console.log("Parameter temperature alertActivationLevel changed %s", this.alertActivationLevel);
                break;
            case ParameterIds.PID_HYSTERESIS:
                break;
            case ParameterIds.PID_ALERT_ACTIVATION_DELAY:

                break;
            case ParameterIds.PID_DEALERT_ACTIVATION_DELAY:

                break;
            default:
                console.log("unexpected Parameter id: %s value: %s", id, value);
        }
    }
}
