import { PairingIds, ParameterIds, Device } from '../freeAtHomeApi';
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

enum PlayMode {
    idle = 0,
    playing = 1,
    paused = 2,
    buffering = 3,
}

enum PlayCommand {   
    Next = 2,
    Previous = 3,    
    VolumeDec = 4,
    VolumeInc = 12,    
}

enum SetMute {
    Unmute = 0,
    Mute = 1
}

enum PlayControls {
    PlayStop = 3,
    PlayStopNextPrev = 127
}

interface ChannelEvents {
    playModeChanged(value: PlayMode.playing | PlayMode.paused): void;
    playCommandChanged(value: PlayCommand.Next | PlayCommand.Previous | PlayCommand.VolumeDec | PlayCommand.VolumeInc): void;
    muteChanged(value: SetMute.Mute | SetMute.Unmute): void;
    playVolumeChanged(value: number): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class MediaPlayerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(device: Device, channelNumber: number) {
        super(device, channelNumber);
        device.on("datapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    public static readonly PlayMode = PlayMode;
    public static readonly PlayCommand = PlayCommand;
    public static readonly PlayControls = PlayControls;
    public static readonly SetMute = SetMute;

    protected dataPointChanged(id: PairingIds, value: string): void {
        //console.log("ID:" + id);
        //console.log("with value: " + value);
        switch (id) {
            case PairingIds.AL_MEDIA_PLAY: // play
                this.emit("playModeChanged", PlayMode.playing);
                break;

            case PairingIds.AL_MEDIA_PAUSE: // stop
                this.emit("playModeChanged", PlayMode.paused);
                break;
            case PairingIds.AL_MEDIA_NEXT:
                this.emit("playCommandChanged", PlayCommand.Next);
                break;
            case PairingIds.AL_MEDIA_PREVIOUS:
                this.emit("playCommandChanged", PlayCommand.Previous);
                break;
            case PairingIds.AL_RELATIVE_VOLUME_CONTROL:
                if(parseInt(value) === PlayCommand.VolumeDec) this.emit("playCommandChanged", PlayCommand.VolumeDec);
                else if(parseInt(value) === PlayCommand.VolumeInc) this.emit("playCommandChanged", PlayCommand.VolumeInc);
                break;
            case PairingIds.AL_ABSOLUTE_VOLUME_CONTROL:
                this.emit("playVolumeChanged", parseInt(value));
                break;
            case PairingIds.AL_MEDIA_MUTE:
                if (parseInt(value) === SetMute.Mute) this.emit("muteChanged", SetMute.Mute);
                else if (parseInt(value) === SetMute.Unmute) this.emit("muteChanged", SetMute.Unmute);
                break;
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {

    }

    setTitle(value: string): void {
        this.setDatapoint(PairingIds.AL_INFO_MEDIA_CURRENT_ITEM_METADATA, value); // todo: add number to PairingIds
    }

    setInput(value: string): void {
        this.setDatapoint(PairingIds.AL_INFO_CURRENT_MEDIA_SOURCE, value);
    }

    setPlayMode(playMode: PlayMode) {
        this.setDatapoint(PairingIds.AL_PLAYBACK_STATUS, playMode.toString()); // todo: add number to PairingIds
    }

    setMute(mute: SetMute): void {
        this.setDatapoint(PairingIds.AL_INFO_MUTE, mute.toString());
    }

    setVolume(value: number) {
        this.setDatapoint(PairingIds.AL_INFO_ACTUAL_VOLUME, value.toString());
    }
    
    setControls(value: PlayControls) {
        this.setDatapoint(PairingIds.AL_ALLOWED_PLAYBACK_ACTIONS, value.toString());
    }

}
