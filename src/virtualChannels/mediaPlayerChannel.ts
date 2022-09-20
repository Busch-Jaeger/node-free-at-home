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
    playNext(): void;
    playPrevious(): void;
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

    private playMode: MediaPlayerChannel.PlayMode = MediaPlayerChannel.PlayMode.paused;
    private repeadMode: MediaPlayerChannel.RepeadMode = MediaPlayerChannel.RepeadMode.off;
    private isShuffel: boolean = false;
    private isCrossfade: boolean = false;
    private allowedActions: MediaPlayerChannel.Actions = {};

    protected dataPointChanged(id: PairingIds, value: string): void {
        //console.log("ID:" + id);
        //console.log("with value: " + value);
        switch (id) {
            case PairingIds.AL_MEDIA_PLAY: // play
                this.emit("playModeChanged", MediaPlayerChannel.PlayMode.playing);
                if (this.isAutoConfirm) {
                    this.playMode = MediaPlayerChannel.PlayMode.playing;
                    this.updatePlayMode();
                }
                break;

            case PairingIds.AL_MEDIA_PAUSE: // stop
                this.emit("playModeChanged", MediaPlayerChannel.PlayMode.paused);
                if (this.isAutoConfirm) {
                    this.playMode = MediaPlayerChannel.PlayMode.paused;
                    this.updatePlayMode();
                }
                break;
            case PairingIds.AL_MEDIA_NEXT:
                this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.Next);
                this.emit("playNext");
                break;
            case PairingIds.AL_MEDIA_PREVIOUS:
                this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.Previous);
                this.emit("playPrevious");
                break;
            case PairingIds.AL_RELATIVE_VOLUME_CONTROL:
                if (parseInt(value) === MediaPlayerChannel.PlayCommand.VolumeDec) this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.VolumeDec);
                else if (parseInt(value) === MediaPlayerChannel.PlayCommand.VolumeInc) this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.VolumeInc);
                break;
            case PairingIds.AL_ABSOLUTE_VOLUME_CONTROL:
                this.emit("playVolumeChanged", parseInt(value));
                if (this.isAutoConfirm)
                    this.setDatapoint(PairingIds.AL_INFO_ACTUAL_VOLUME, value);
                break;
            case PairingIds.AL_MEDIA_MUTE:
                if (parseInt(value) === MediaPlayerChannel.SetMute.Mute) this.emit("muteChanged", MediaPlayerChannel.SetMute.Mute);
                else if (parseInt(value) === MediaPlayerChannel.SetMute.Unmute) this.emit("muteChanged", MediaPlayerChannel.SetMute.Unmute);
                break;
            case PairingIds.AL_MEDIA_PLAY_MODE:
                const intValue = parseInt(value);
                if ((intValue & (1 << 4)) != 0)
                    if (this.isAutoConfirm)
                        this.isShuffel = true;
                if ((intValue & (1 << 4)) == 0)
                    if (this.isAutoConfirm)
                        this.isShuffel = false;

                if ((intValue & (1 << 2)) !== 0)
                    if (this.isAutoConfirm)
                        this.repeadMode = MediaPlayerChannel.RepeadMode.repeat;

                if ((intValue & (1 << 3)) !== 0)
                    if (this.isAutoConfirm) {
                        if (this.allowedActions.canRepeatOne)
                            this.repeadMode = MediaPlayerChannel.RepeadMode.repeatOne;
                        else
                            this.repeadMode = MediaPlayerChannel.RepeadMode.off;
                        this.isShuffel = false;
                    }

                if ((intValue & ((1 << 2) | 1 << 3)) === 0)
                    if (this.isAutoConfirm)
                        this.repeadMode = MediaPlayerChannel.RepeadMode.off;

                if (this.isAutoConfirm)
                    this.updatePlayMode();

                console.log("playmode: ", value);
                break;
        }
    }

    public updatePlayMode() {
        let value: number = 0;
        switch (this.repeadMode) {
            case MediaPlayerChannel.RepeadMode.off:
                break;
            case MediaPlayerChannel.RepeadMode.repeat:
                value |= (1 << 2);
                break;
            case MediaPlayerChannel.RepeadMode.repeatOne:
                value |= (1 << 3);
                break;
        }
        if (this.isShuffel)
            value |= (1 << 4);
        if (this.isCrossfade)
            value |= (1 << 5);
        value |= this.playMode;
        return this.setDatapoint(PairingIds.AL_PLAYBACK_STATUS, value.toString());
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

    setAllowedActions(actions: MediaPlayerChannel.Actions): Promise<void> {
        this.allowedActions = actions;
        let value = 0;
        if (actions?.canSkip)
            value |= 1 << 0;
        if (actions?.canSkipBack)
            value |= 1 << 1;
        if (actions?.canSeek)
            value |= 1 << 2;
        if (actions?.canRepeat)
            value |= 1 << 3;
        if (actions?.canRepeatOne)
            value |= 1 << 4;
        if (actions?.canShuffle)
            value |= 1 << 5;
        if (actions?.canPause)
            value |= 1 << 6;
        if (actions?.canStop)
            value |= 1 << 7;
        return this.setDatapoint(PairingIds.AL_ALLOWED_PLAYBACK_ACTIONS, value.toString());
    }

    setCoverUrl(url: string): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_ALBUM_COVER_URL, url);
    }

    setFavorites(favorites: string[]): Promise<void> {
        return this.setAuxiliaryData(0, favorites);
    }

    setInputss(inputs: string[]): Promise<void> {
        return this.setAuxiliaryData(1, inputs);
    }
}


export namespace MediaPlayerChannel {
    export interface Actions {
        canSkip?: boolean;
        canSkipBack?: boolean;
        canSeek?: boolean;
        canRepeat?: boolean;
        canRepeatOne?: boolean;
        canShuffle?: boolean;
        canPause?: boolean;
        canStop?: boolean;
    }

    export enum PlayMode {
        idle = 0,
        playing = 1,
        paused = 2,
        buffering = 3,
    }

    export enum RepeadMode {
        off,
        repeat,
        repeatOne
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