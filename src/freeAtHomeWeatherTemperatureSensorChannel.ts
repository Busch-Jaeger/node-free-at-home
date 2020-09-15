import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';

import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class FreeAtHomeWeatherTemperatureSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "Weather-TemperatureSensor");
    }

    alertActivationLevel: number | undefined = undefined;

    setTemperature(temperature: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(PairingIds.AL_OUTDOOR_TEMPERATURE, <string><unknown>temperature);
        console.log("new temperature %s", temperature);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel <= temperature)
                this.setDatapoint(PairingIds.AL_FROST_ALARM, "1");
            else
                this.setDatapoint(PairingIds.AL_FROST_ALARM, "0");
        }
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

        switch (id) {
            case ParameterIds.frostAlarmActivationLevel:
                this.alertActivationLevel = <number>parseInt(value);
                console.log("Parameter temperature alertActivationLevel changed %s", this.alertActivationLevel);
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
