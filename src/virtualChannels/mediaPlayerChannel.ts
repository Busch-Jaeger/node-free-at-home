import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';
import { Datapoint } from '..';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    playModeChanged(value: MediaPlayerChannel.PlayMode.playing | MediaPlayerChannel.PlayMode.paused): void;
    playCommandChanged(value: MediaPlayerChannel.PlayCommand.Next | MediaPlayerChannel.PlayCommand.Previous | MediaPlayerChannel.PlayCommand.VolumeDec | MediaPlayerChannel.PlayCommand.VolumeInc): void;
    muteChanged(value: MediaPlayerChannel.SetMute.Mute | MediaPlayerChannel.SetMute.Unmute): void;
    playVolumeChanged(value: number): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class MediaPlayerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel) {
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
    }

    // public static readonly MediaPlayerChannel.PlayMode = MediaPlayerChannel.PlayMode;
    // public static readonly PlayCommand = PlayCommand;
    // public static readonly PlayControls = PlayControls;
    // public static readonly SetMute = SetMute;

    protected dataPointChanged(id: PairingIds, value: string): void {
        //console.log("ID:" + id);
        //console.log("with value: " + value);
        switch (id) {
            case PairingIds.AL_MEDIA_PLAY: // play
                this.emit("playModeChanged", MediaPlayerChannel.PlayMode.playing);
                break;

            case PairingIds.AL_MEDIA_PAUSE: // stop
                this.emit("playModeChanged", MediaPlayerChannel.PlayMode.paused);
                break;
            case PairingIds.AL_MEDIA_NEXT:
                this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.Next);
                break;
            case PairingIds.AL_MEDIA_PREVIOUS:
                this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.Previous);
                break;
            case PairingIds.AL_RELATIVE_VOLUME_CONTROL:
                if (parseInt(value) === MediaPlayerChannel.PlayCommand.VolumeDec) this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.VolumeDec);
                else if (parseInt(value) === MediaPlayerChannel.PlayCommand.VolumeInc) this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.VolumeInc);
                break;
            case PairingIds.AL_ABSOLUTE_VOLUME_CONTROL:
                this.emit("playVolumeChanged", parseInt(value));
                break;
            case PairingIds.AL_MEDIA_MUTE:
                if (parseInt(value) === MediaPlayerChannel.SetMute.Mute) this.emit("muteChanged", MediaPlayerChannel.SetMute.Mute);
                else if (parseInt(value) === MediaPlayerChannel.SetMute.Unmute) this.emit("muteChanged", MediaPlayerChannel.SetMute.Unmute);
                break;
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {

    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            //Only work on non-empty commands
            if (datapoint.value !== "") {
                switch (datapoint.pairingID) {
                    case PairingIds.AL_PLAYBACK_STATUS:
                        if (parseInt(datapoint.value) == MediaPlayerChannel.PlayMode.playing) this.emit("playModeChanged", MediaPlayerChannel.PlayMode.playing);
                        else if (parseInt(datapoint.value) == MediaPlayerChannel.PlayMode.paused) this.emit("playModeChanged", MediaPlayerChannel.PlayMode.paused);
                        break;
                    case PairingIds.AL_INFO_MUTE:
                        if (parseInt(datapoint.value) === MediaPlayerChannel.SetMute.Mute) this.emit("muteChanged", MediaPlayerChannel.SetMute.Mute);
                        else if (parseInt(datapoint.value) === MediaPlayerChannel.SetMute.Unmute) this.emit("muteChanged", MediaPlayerChannel.SetMute.Unmute);
                        break;
                    case PairingIds.AL_INFO_ACTUAL_VOLUME:
                        this.emit("playVolumeChanged", parseInt(datapoint.value));
                        break;
                    case PairingIds.AL_INFO_GROUP_MEMBERSHIP:
                        break;
                    case PairingIds.AL_INFO_PLAYING_FAVORITE:
                        break;
                }
            }
        }
    }

    setTitle(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_MEDIA_CURRENT_ITEM_METADATA, value); // todo: add number to PairingIds
    }

    setInput(value: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_CURRENT_MEDIA_SOURCE, value);
    }

    setPlayMode(playMode: MediaPlayerChannel.PlayMode): Promise<void> {
        return this.setDatapoint(PairingIds.AL_PLAYBACK_STATUS, playMode.toString()); // todo: add number to PairingIds
    }

    setMute(mute: MediaPlayerChannel.SetMute): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_MUTE, mute.toString());
    }

    setVolume(value: number): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_ACTUAL_VOLUME, value.toString());
    }

    setControls(value: MediaPlayerChannel.PlayControls): Promise<void> {
        return this.setDatapoint(PairingIds.AL_ALLOWED_PLAYBACK_ACTIONS, value.toString());
    }

}


export namespace MediaPlayerChannel {
    export enum PlayMode {
        idle = 0,
        playing = 1,
        paused = 2,
        buffering = 3,
    }

    export enum PlayCommand {
        Next = 2,
        Previous = 3,
        VolumeDec = 4,
        VolumeInc = 12,
    }

    export enum SetMute {
        Unmute = 0,
        Mute = 1
    }

    export enum PlayControls {
        PlayStop = 3,
        PlayStopNextPrev = 127
    }
} 