import { PairingIds, ParameterIds, Topics } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';
import { Datapoint } from '..';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    /**
     * @deprecated The method should not be used
     */
    playModeChanged(value: MediaPlayerChannel.PlayMode.playing | MediaPlayerChannel.PlayMode.paused): void;
    /**
     * @deprecated The method should not be used
     */
    playCommandChanged(value: MediaPlayerChannel.PlayCommand.Next | MediaPlayerChannel.PlayCommand.Previous | MediaPlayerChannel.PlayCommand.VolumeDec | MediaPlayerChannel.PlayCommand.VolumeInc): void;
    /**
     * @deprecated The method should not be used
     */
    muteChanged(value: MediaPlayerChannel.SetMute.Mute | MediaPlayerChannel.SetMute.Unmute): void;
    /**
     * @deprecated The method should not be used
     */
    playVolumeChanged(value: number): void;

    play(): void,
    pause(): void,

    mute(): void;
    unMute(): void;

    next(): void;
    previous(): void;

    volume(value: number): void;
    volumeDec(): void;
    volumeInc(): void;

    shuffle(): void;
    shuffleOff(): void;

    repeatOff(): void;
    repeat(): void;
    repeatOne(): void;

    playlist(value: number): void;
    input(value: number): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class MediaPlayerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel) {
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
    }

    private playMode: MediaPlayerChannel.PlayMode = MediaPlayerChannel.PlayMode.paused;
    private repeadMode: MediaPlayerChannel.RepeadMode = MediaPlayerChannel.RepeadMode.off;
    private isShuffle: boolean = false;
    private isCrossfade: boolean = false;

    private favoriteCount: number = 0;
    private lastSelectedFavorit: number | undefined = undefined;

    private parameterMaxVolume: number = 100;

    private lastVolume: number = 0;
    static readonly volumeChangeInterval = 4;
    static readonly volumeIntervalTime = 500;
    private volumeIntervalTimer: ReturnType<typeof setInterval> | undefined = undefined

    private stopIntervalTimer() {
        if (undefined !== this.volumeIntervalTimer) {
            clearInterval(this.volumeIntervalTimer);
            this.volumeIntervalTimer = undefined;
        }
    }

    private startIntervalTimer(callback: () => void) {
        this.stopIntervalTimer();
        this.volumeIntervalTimer = setInterval(callback, MediaPlayerChannel.volumeIntervalTime);
    }

    private incrementVolume() {
        let volume = this.lastVolume;
        volume += MediaPlayerChannel.volumeChangeInterval;
        if (volume > this.parameterMaxVolume)
            volume = this.parameterMaxVolume;
        this.emit("playVolumeChanged", volume);
        this.emit("volume", volume);
        if (this.isAutoConfirm)
            this.setVolume(volume);
    }

    private decrementVolume() {
        let volume = this.lastVolume;
        volume -= MediaPlayerChannel.volumeChangeInterval;
        if (volume < 0)
            volume = 0;
        if (volume > this.parameterMaxVolume)
            volume = this.parameterMaxVolume;
        this.emit("playVolumeChanged", volume);
        this.emit("volume", volume);
        if (this.isAutoConfirm)
            this.setVolume(volume);
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (id) {
            case PairingIds.AL_MEDIA_PLAY: // play
                this.emit("playModeChanged", MediaPlayerChannel.PlayMode.playing);
                this.emit("play");
                if (this.isAutoConfirm) {
                    this.playMode = MediaPlayerChannel.PlayMode.playing;
                    this.updatePlayMode();
                }
                break;
            case PairingIds.AL_MEDIA_PAUSE: // stop
                this.emit("playModeChanged", MediaPlayerChannel.PlayMode.paused);
                this.emit("pause");
                if (this.isAutoConfirm) {
                    if (this.playMode !== MediaPlayerChannel.PlayMode.paused)
                        this.playMode = MediaPlayerChannel.PlayMode.paused;
                    else
                        this.playMode = MediaPlayerChannel.PlayMode.playing;
                    this.updatePlayMode();
                }
                break;
            case PairingIds.AL_MEDIA_NEXT:
                this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.Next);
                this.emit("next");
                break;
            case PairingIds.AL_MEDIA_PREVIOUS:
                this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.Previous);
                this.emit("previous");
                break;
            case PairingIds.AL_RELATIVE_VOLUME_CONTROL:
                if (parseInt(value) === MediaPlayerChannel.PlayCommand.VolumeDec) this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.VolumeDec);
                else if (parseInt(value) === MediaPlayerChannel.PlayCommand.VolumeInc) this.emit("playCommandChanged", MediaPlayerChannel.PlayCommand.VolumeInc);
                console.log(value);
                switch (value) {
                    case '12': //volume inc
                        this.stopIntervalTimer();
                        this.incrementVolume();
                        break;
                    case '4': //volume dec
                        this.stopIntervalTimer();
                        this.decrementVolume();
                        break;
                    case '9': //volume inc long presed
                        this.incrementVolume();
                        this.startIntervalTimer(() => {
                            this.incrementVolume();
                        });
                        break;
                    case '8': //volume inc long released
                        this.stopIntervalTimer();
                        break;
                    case '1': //volume dec long presed 
                        this.decrementVolume();
                        this.startIntervalTimer(() => {
                            this.decrementVolume();
                        });
                        break;
                    case '0': //volume dec long released
                        this.stopIntervalTimer();
                        break;
                }
                break;
            case PairingIds.AL_ABSOLUTE_VOLUME_CONTROL:
                let volume = parseInt(value);
                if(volume > this.parameterMaxVolume)
                    volume = this.parameterMaxVolume;
                this.emit("playVolumeChanged", volume);
                this.emit("volume", volume);
                if (this.isAutoConfirm)
                    this.setVolume(volume);
                break;
            case PairingIds.AL_MEDIA_MUTE:
                switch (parseInt(value)) {
                    case MediaPlayerChannel.SetMute.Mute:
                        this.emit("muteChanged", MediaPlayerChannel.SetMute.Mute);
                        this.emit("mute");
                        if (this.isAutoConfirm)
                            this.setMute();
                        break;
                    case MediaPlayerChannel.SetMute.Unmute:
                        this.emit("muteChanged", MediaPlayerChannel.SetMute.Unmute);
                        this.emit("unMute");
                        if (this.isAutoConfirm)
                            this.setUnMute();
                        break;
                }
                break;
            case PairingIds.AL_MEDIA_PLAY_MODE:
                const intValue = parseInt(value);

                if ((intValue & (1 << 4)) !== 0) {
                    if (this.isShuffle === false)
                        this.emit("shuffle");
                    if (this.isAutoConfirm)
                        this.isShuffle = true;
                }
                else {
                    if (this.isShuffle === true)
                        this.emit("shuffleOff");
                    if (this.isAutoConfirm)
                        this.isShuffle = false;
                }

                if ((intValue & (1 << 2)) !== 0) {
                    if (this.repeadMode !== MediaPlayerChannel.RepeadMode.repeat)
                        this.emit("repeat");
                    if (this.isAutoConfirm)
                        this.repeadMode = MediaPlayerChannel.RepeadMode.repeat;
                }

                if ((intValue & (1 << 3)) !== 0) {
                    if (this.repeadMode !== MediaPlayerChannel.RepeadMode.repeatOne)
                        this.emit("repeatOne");
                    if (this.isAutoConfirm)
                        this.repeadMode = MediaPlayerChannel.RepeadMode.repeatOne;
                }

                if ((intValue & ((1 << 2) | 1 << 3)) === 0) {
                    if (this.repeadMode !== MediaPlayerChannel.RepeadMode.off)
                        this.emit("repeatOff");
                    if (this.isAutoConfirm)
                        this.repeadMode = MediaPlayerChannel.RepeadMode.off;
                }

                if (this.isAutoConfirm)
                    this.updatePlayMode();

                break;
            case PairingIds.AL_PLAY_NEXT_FAVORITE:
                if (0 === this.favoriteCount)
                    return;
                let index = (undefined !== this.lastSelectedFavorit) ? this.lastSelectedFavorit + 1 : 0;
                if (index >= this.favoriteCount)
                    index = 0;
                this.emit("playlist", index);
                if (this.isAutoConfirm) {
                    this.setPlaylistIndex(index);
                }
                break;
            case PairingIds.AL_SELECT_PROFILE:
                {
                    const intValue = parseInt(value);
                    const topicIndex = intValue >> 8;
                    const index = (intValue & 0xff) - 1;
                    switch (topicIndex) {
                        case Topics.TOP_MEDIA_PLAYER_PLAYLIST:
                            this.emit("playlist", index);
                            this.lastSelectedFavorit = index;
                            if (this.isAutoConfirm)
                                this.setPlaylistIndex(index);
                            break;
                        case Topics.TOP_MEDIA_PLAYER_AUDIO_INPUT:
                            this.emit("input", index);
                            if (this.isAutoConfirm)
                                this.setInputIndex(index);
                            break;
                        default:
                            console.error("unknown profile index received ", topicIndex);
                    }
                }
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
        if (this.isShuffle)
            value |= (1 << 4);
        if (this.isCrossfade)
            value |= (1 << 5);
        value |= this.playMode;
        return this.setDatapoint(PairingIds.AL_PLAYBACK_STATUS, value.toString());
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
        switch(id) {
            case ParameterIds.PID_SONOS_PLAYER_VOLUME_LIMIT:
                this.parameterMaxVolume = parseInt(value);
                break;
        }
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            //Only work on non-empty commands
            if (datapoint.value === "")
                continue;
            const value = datapoint.value;
            switch (datapoint.pairingID) {
                case PairingIds.AL_PLAYBACK_STATUS:
                    switch (parseInt(value)) {
                        case MediaPlayerChannel.PlayMode.playing:
                            this.emit("playModeChanged", MediaPlayerChannel.PlayMode.playing);
                            this.emit("play");
                            if (this.isAutoConfirm) {
                                this.playMode = MediaPlayerChannel.PlayMode.playing;
                                this.updatePlayMode();
                            }
                            break;
                        case MediaPlayerChannel.PlayMode.paused:
                            this.emit("playModeChanged", MediaPlayerChannel.PlayMode.paused);
                            this.emit("pause");
                            if (this.isAutoConfirm) {
                                this.playMode = MediaPlayerChannel.PlayMode.paused;
                                this.updatePlayMode();
                            }
                            break;
                    }
                    break;
                case PairingIds.AL_INFO_MUTE:
                    switch (parseInt(value)) {
                        case MediaPlayerChannel.SetMute.Mute:
                            this.emit("muteChanged", MediaPlayerChannel.SetMute.Mute);
                            this.emit("mute");
                            if (this.isAutoConfirm)
                                this.setMute();
                            break;
                        case MediaPlayerChannel.SetMute.Unmute:
                            this.emit("muteChanged", MediaPlayerChannel.SetMute.Unmute);
                            this.emit("unMute");
                            if (this.isAutoConfirm)
                                this.setUnMute();
                            break;
                    }
                    break;
                case PairingIds.AL_INFO_ACTUAL_VOLUME:
                    let volume = parseInt(value);
                    if(volume > this.parameterMaxVolume)
                        volume = this.parameterMaxVolume;

                    this.emit("playVolumeChanged", volume);
                    this.emit("volume", volume);
                    if (this.isAutoConfirm)
                        this.setDatapoint(PairingIds.AL_INFO_ACTUAL_VOLUME, volume.toString());
                    break;
                case PairingIds.AL_INFO_GROUP_MEMBERSHIP:
                    break;
                case PairingIds.AL_INFO_PLAYING_FAVORITE:
                    break;
                case PairingIds.AL_INFO_PLAYLIST:
                    {
                        const intValue = parseInt(value) - 1;
                        this.emit("playlist", intValue);
                        this.lastSelectedFavorit = intValue;
                        if (this.isAutoConfirm)
                            this.setPlaylistIndex(intValue);
                        break;
                    }
                case PairingIds.AL_INFO_AUDIO_INPUT:
                    {
                        const intValue = parseInt(value) - 1;
                        this.emit("input", intValue);
                        if (this.isAutoConfirm)
                            this.setInputIndex(parseInt(value));
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

    /**
     * @deprecated The method should not be used
     */
    setPlayMode(playMode: MediaPlayerChannel.PlayMode): Promise<void> {
        this.playMode = playMode;
        return this.updatePlayMode();
    }

    setPlaying(): Promise<void> {
        this.playMode = MediaPlayerChannel.PlayMode.playing;
        return this.updatePlayMode();
    }

    setPaused(): Promise<void> {
        this.playMode = MediaPlayerChannel.PlayMode.paused;
        return this.updatePlayMode();
    }

    setMute(): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_MUTE, MediaPlayerChannel.SetMute.Mute.toString());
    }

    setUnMute(): Promise<void> {
        return this.setDatapoint(PairingIds.AL_INFO_MUTE, MediaPlayerChannel.SetMute.Unmute.toString());
    }

    setVolume(value: number): Promise<void> {
        this.lastVolume = value;
        return this.setDatapoint(PairingIds.AL_INFO_ACTUAL_VOLUME, value.toString());
    }

    /**
     * @deprecated The method should not be used
     */
    setControls(value: MediaPlayerChannel.PlayControls): Promise<void> {
        return this.setDatapoint(PairingIds.AL_ALLOWED_PLAYBACK_ACTIONS, value.toString());
    }

    setAllowedActions(actions: MediaPlayerChannel.Actions): Promise<void> {
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

    /**
     * @deprecated The method should not be used, use setPlazlists instead
     */
    setFavorites(favorites: string[]): Promise<void> {
        this.favoriteCount = favorites.length;
        return this.setAuxiliaryData(Topics.TOP_MEDIA_PLAYER_PLAYLIST, favorites);
    }

    setPlaylists(playlists: string[]): Promise<void> {
        this.favoriteCount = playlists.length;
        return this.setAuxiliaryData(Topics.TOP_MEDIA_PLAYER_PLAYLIST, playlists);
    }

    async setPlaylistIndex(value?: number): Promise<void> {
        this.lastSelectedFavorit = value;
        value = (undefined === value) ? 0 : value + 1;
        return this.setDatapoint(PairingIds.AL_INFO_PLAYLIST, value.toString());
    }

    setInputs(inputs: string[]): Promise<void> {
        return this.setAuxiliaryData(Topics.TOP_MEDIA_PLAYER_AUDIO_INPUT, inputs);
    }

    async setInputIndex(value?: number): Promise<void> {
        value = (undefined === value) ? 0 : value + 1;
        return this.setDatapoint(PairingIds.AL_INFO_AUDIO_INPUT, value.toString());
    }

    async setShuffle(): Promise<void> {
        this.isShuffle = true;
        return this.updatePlayMode();
    }

    async setShuffleOff(): Promise<void> {
        this.isShuffle = false;
        return this.updatePlayMode();
    }

    async setRepeatOff(): Promise<void> {
        this.repeadMode = MediaPlayerChannel.RepeadMode.off;
        return this.updatePlayMode();
    }

    async setRepeat(): Promise<void> {
        this.repeadMode = MediaPlayerChannel.RepeadMode.repeat;
        return this.updatePlayMode();
    }
    
    async setRepeatOne(): Promise<void> {
        this.repeadMode = MediaPlayerChannel.RepeadMode.repeatOne;
        return this.updatePlayMode();
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