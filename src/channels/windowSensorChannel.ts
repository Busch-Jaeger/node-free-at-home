import { PairingIds, ParameterIds, Device } from '../freeAtHomeApi';

import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;


export enum WindowState {
    closed,
    tilted,
    opened,
}

export class WindowSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(device: Device, channelNumber: number){
        super(device, channelNumber);
        device.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    setWindowState(state: WindowState): void {
        switch (state) {
            case WindowState.closed:
                this.setDatapoint(PairingIds.AL_WINDOW_DOOR, "0");
                this.setDatapoint(PairingIds.AL_WINDOW_DOOR_POSITION, "0");
                break;
            case WindowState.tilted:
                this.setDatapoint(PairingIds.AL_WINDOW_DOOR, "1");
                this.setDatapoint(PairingIds.AL_WINDOW_DOOR_POSITION, "1");
                break;
            case WindowState.opened:
                this.setDatapoint(PairingIds.AL_WINDOW_DOOR, "1");
                this.setDatapoint(PairingIds.AL_WINDOW_DOOR_POSITION, "0");
                break;
            default:
                console.error("unknown window state: %s", state);
        }
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
    }

    protected parameterChanged(id: ParameterIds, value: string): void {

    }
}
