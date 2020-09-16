import { PairingIds, ParameterIds, Device } from '../freeAtHomeApi';

import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

import '../utilities';

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
    constructor(device: Device, channelNumber: number){
        super(device, channelNumber);
        device.on("datapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    windAlarmLevel: number | undefined = undefined;

    setWindSpeed(windSpeed: number): void {
        this.setDatapoint(PairingIds.AL_WIND_SPEED, <string><unknown>windSpeed);

        const alarmLevel = windAlarmLevels.binaryIndexOf(windSpeed);
        console.log("wind alarm level: %s", alarmLevel);
        this.setDatapoint(PairingIds.AL_WIND_FORCE, <string><unknown>alarmLevel);

        if (this.windAlarmLevel !== undefined) {
            if (this.windAlarmLevel <= alarmLevel) {
                this.setDatapoint(PairingIds.AL_WIND_ALARM, "1");
            } else {
                this.setDatapoint(PairingIds.AL_WIND_ALARM, "0");
            }
        }
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {

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
