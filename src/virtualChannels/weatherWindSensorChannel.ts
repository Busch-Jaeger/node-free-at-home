import {PairingIds, ParameterIds} from '../freeAtHomeApi';
import {ApiVirtualChannel} from "../api/apiVirtualChannel";

import {Channel} from '../channel';
import {Mixin} from 'ts-mixer';

import {EventEmitter} from 'events';
import {StrictEventEmitter} from 'strict-event-emitter-types';
import '../utilities';
import {DelayedAlertSystem} from "./delayedAlertSystem";

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

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

export class WeatherWindSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    private alarmSystem : DelayedAlertSystem;
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        this.alarmSystem = new DelayedAlertSystem();
    }

    windAlarmLevel: number | undefined = undefined;

    setWindSpeed(windSpeed: number): void {
        this.setDatapoint(PairingIds.AL_WIND_SPEED, <string><unknown>windSpeed);
        const alarmLevel = this.getBeaufortLevel(windSpeed);
        console.log("wind alarm level: %s", alarmLevel);
        this.setDatapoint(PairingIds.AL_WIND_FORCE, <string><unknown>alarmLevel);

        if (this.windAlarmLevel !== undefined) {
            if (this.windAlarmLevel <= alarmLevel) {
                this.alarmSystem.alertDelayed(this,PairingIds.AL_WIND_ALARM)
            } else {
                this.alarmSystem.dealertDelayed(this, PairingIds.AL_WIND_ALARM);
            }
        }
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
        switch (id) {
            case ParameterIds.PID_WIND_FORCE:
                this.windAlarmLevel = <number>parseInt(value);
                console.log("Parameter wind alarm activation level changed %s", this.windAlarmLevel);
                break;
            case ParameterIds.PID_ALERT_ACTIVATION_DELAY:
                //TODO Delay value ist Minuten ??
                const alertActivationDelay = <number>parseInt(value);
                console.log("Parameter wind alarm activation delay changed %s", alertActivationDelay);
                this.alarmSystem.setActivationDelay(alertActivationDelay)
                break;
            case ParameterIds.PID_DEALERT_ACTIVATION_DELAY:
                const dealertActivationDelay = <number>parseInt(value);
                console.log("Parameter wind alarm deactivation delay changed %s", dealertActivationDelay);
                this.alarmSystem.setDeactivatoinDelay(dealertActivationDelay)
                break;
            default:
                console.log("unexpected Parameter id: %s value: %s", id, value);
        }
    }

    private getBeaufortLevel(windSpeed:number) {
        for(let i = 0; i < windAlarmLevels.length; i++) {
            if(windSpeed < windAlarmLevels[i]) {
                return i-1;
            }
        }
        return 12; // If the wind speed is beyond the highest value in the array
    }
}
