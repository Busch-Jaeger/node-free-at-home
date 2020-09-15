import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';

import { Channel } from './channel';
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

export class FreeAtHomeWindowSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "WindowSensor");
    }

    setWindowState(state: WindowState): void {
        switch (state) {
            case WindowState.closed:
                this.setDatapoint(PairingIds.windowDoor, "0");
                this.setDatapoint(PairingIds.windowDoorPosition, "0");
                break;
            case WindowState.tilted:
                this.setDatapoint(PairingIds.windowDoor, "1");
                this.setDatapoint(PairingIds.windowDoorPosition, "1");
                break;
            case WindowState.opened:
                this.setDatapoint(PairingIds.windowDoor, "1");
                this.setDatapoint(PairingIds.windowDoorPosition, "0");
                break;
            default:
                console.error("unknown window state: %s", state);
        }
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

    }
}
