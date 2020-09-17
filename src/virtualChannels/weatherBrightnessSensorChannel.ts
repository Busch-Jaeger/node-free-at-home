import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class WeatherBrightnessSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    alertActivationLevel: number | undefined = undefined;

    setBrightnessLevel(brightness: number): void {
        this.setDatapoint(PairingIds.AL_BRIGHTNESS_LEVEL, <string><unknown>brightness);
        console.log("new brightness %s", brightness);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel <= brightness)
                this.setDatapoint(PairingIds.AL_BRIGHTNESS_ALARM, "1");
            else
                this.setDatapoint(PairingIds.AL_BRIGHTNESS_ALARM, "0");
        }
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {

        switch (id) {
            case ParameterIds.brightnessAlertActivationLevel:
                this.alertActivationLevel = <number>parseInt(value);
                console.log("Parameter brightness changed %s", this.alertActivationLevel);
                break;
            case ParameterIds.hysteresis:
                break;
            case ParameterIds.alertActivationDelay:

                break;
            case ParameterIds.dealertActivationDelay:

                break;
            default:
                console.log("unexpected Parameter id: %s value: %s", id, value);
        }
    }
}