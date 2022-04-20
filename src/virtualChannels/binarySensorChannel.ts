import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { Datapoint } from '..';

interface ChannelEvents {
    
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class BinarySensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel) {
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
    }

    //Output Datapoints
    //miss ing 2, 3, 4, 6, 16, 32, 33, 40, 53, 309
    setOnOff(isOn: boolean): void {
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_SWITCH_ON_OFF, value);
    }

    setWindAlarm(isOn: boolean): void {
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_WIND_ALARM, value);
    }

    setFrostAlarm(isOn: boolean): void {
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_FROST_ALARM, value);
    }


    setRainAlarm(isOn: boolean): void {
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_RAIN_ALARM, value);
    }



    //Input Datapoints
    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {
            case PairingIds.AL_INFO_ON_OFF: {
                break;
            }
            case PairingIds.AL_INFO_ACTUAL_DIMMING_VALUE: {
                break;
            }
            case PairingIds.AL_INFO_MOVE_UP_DOWN: {
                break;
            }            
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    protected sceneTriggered(scene: Datapoint[]): void {
    }
}