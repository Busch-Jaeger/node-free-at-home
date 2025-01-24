import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";

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
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    async setWindowState(state: WindowState): Promise<void> {
        switch (state) {
            case WindowState.closed:
                await this.setDatapoint(PairingIds.AL_WINDOW_DOOR, "0");
                await this.setDatapointIfItExsists(PairingIds.AL_WINDOW_DOOR_POSITION, "0");
                break;
            case WindowState.tilted:
                await this.setDatapoint(PairingIds.AL_WINDOW_DOOR, "1");
                await this.setDatapointIfItExsists(PairingIds.AL_WINDOW_DOOR_POSITION, "1");
                break;
            case WindowState.opened:
                await this.setDatapoint(PairingIds.AL_WINDOW_DOOR, "1");
                await this.setDatapointIfItExsists(PairingIds.AL_WINDOW_DOOR_POSITION, "0");
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
