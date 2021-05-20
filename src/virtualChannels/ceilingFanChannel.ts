import { FreeAtHomeApi, PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    isOnChanged(value: boolean): void;
    relativeFanSpeedChanged(value: number): void;
    absoluteFanSpeedChanged(value: number): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class CeilingFanChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    //Output Datapoints
    setOnOff(isOn: boolean): void {
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
    }

    setAbsoluteFanSpeed(absoluteSpeed: string): void {
        this.setDatapoint(PairingIds.AL_INFO_ABSOLUTE_FAN_SPEED, absoluteSpeed);
    }

    setError(Error: string): void {
        this.setDatapoint(PairingIds.AL_INFO_ERROR, Error);
    }

    setForce(Force: string): void {
        this.setDatapoint(PairingIds.AL_INFO_FORCE, Force);
    }

    //Input Datapoints
    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {
            case PairingIds.AL_SWITCH_ON_OFF: {
                switch (value) {
                    case "1": {
                        this.emit("isOnChanged", true);
                        break;
                    }
                    case "0": {
                        this.emit("isOnChanged", false);
                        break;
                    }
                }
                break;
            }
            case PairingIds.AL_RELATIVE_FAN_SPEED_CONTROL: {
                this.emit("relativeFanSpeedChanged", parseInt(value));
                break;
            }
            case PairingIds.AL_ABSOLUTE_FAN_SPEED_CONTROL: {
                this.emit("absoluteFanSpeedChanged", parseInt(value));
                break;
            }
            case PairingIds.AL_TIMED_START_STOP: {
                break;
            }
            case PairingIds.AL_FORCED: {
                break;
            }
            case PairingIds.AL_SCENE_CONTROL: {
                break;
            }
            case PairingIds.AL_TIMED_MOVEMENT: {
                break;
            }
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

}