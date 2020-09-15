import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

enum PlayMode {
    idle = 0,
    playing = 1,
    paused = 2,
    buffering = 3,
}

interface ChannelEvents {
    playModeChanged(value: PlayMode.playing | PlayMode.paused): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class MediaPlayerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "MediaPlayer");
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        switch (id) {
            case PairingIds.AL_MEDIA_PLAY: // play
                this.emit("playModeChanged", PlayMode.playing);
                break;

            case PairingIds.AL_MEDIA_PAUSE: // stop
                this.emit("playModeChanged", PlayMode.paused);
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {

    }

    setTitle(value: string): void {
        this.setDatapoint(PairingIds.AL_INFO_MEDIA_CURRENT_ITEM_METADATA, value); // todo: add number to PairingIds
    }

    setPlayMode(playMode: PlayMode) {
        this.setDatapoint(PairingIds.AL_PLAYBACK_STATUS, playMode.toString()); // todo: add number to PairingIds
    }

}