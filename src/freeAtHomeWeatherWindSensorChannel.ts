import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';

import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

import './utilities';

const windAlarmLevels = [
    0,    //  0
    0.3,  //  1
    1.6,  //  2
    3.4,  //  3
    5.5,  //  4
    8.0,  //  5
    10.8, //  6
    13.9, //  7
    17.2, //  8
    20.8, //  9
    24.5, // 10
    28.5, // 11
    32.7, // 12
]

export class FreeAtHomeWeatherWindSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "Weather-WindSensor");
    }

    windAlarmLevel: number | undefined = undefined;

    setWindSpeed(windSpeed: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(PairingIds.windSpeed, <string><unknown>windSpeed);

        const alarmLevel = windAlarmLevels.binaryIndexOf(windSpeed);
        console.log("wind alarm level: %s", alarmLevel);
        this.setDatapoint(PairingIds.windForce, <string><unknown>alarmLevel);

        if (this.windAlarmLevel !== undefined) {
            if (this.windAlarmLevel <= alarmLevel) {
                this.setDatapoint(PairingIds.windAlarm, "1");
            } else {
                this.setDatapoint(PairingIds.windAlarm, "0");
            }
        }
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

        switch (id) {
            case ParameterIds.windForce:
                this.windAlarmLevel = <number>parseInt(value);
                console.log("Parameter temperature alertActivationLevel changed %s", this.windAlarmLevel);
                break;

            default:
                console.log("unexpected Parameter id: %s value: %s", id, value);
        }
    }
}
