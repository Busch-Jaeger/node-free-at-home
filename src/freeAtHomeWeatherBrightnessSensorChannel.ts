import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class FreeAtHomeWeatherBrightnessSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "Weather-TemperatureSensor");
    }

    alertActivationLevel: number | undefined = undefined;

    setBrightnessLevel(brightness: number): void {
        this.setDatapoint(PairingIds.brightnessLevel, <string><unknown>brightness);
        console.log("new brightness %s", brightness);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel <= brightness)
                this.setDatapoint(PairingIds.brightnessAlarm, "1");
            else
                this.setDatapoint(PairingIds.brightnessAlarm, "0");
        }
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

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