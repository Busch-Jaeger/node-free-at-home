import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { Datapoint } from '..';

interface ChannelEvents {
    isOnChanged(value: boolean): void;
    isForcedChanged(value: boolean): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class SwitchingActuatorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
    }

    setOn(isOn: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, (isOn) ? "1" : "0");
    }

    setForced(isForced: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_FORCE, (isForced) ? "1" : "0");
    }

    protected dataPointChanged(id: PairingIds, value: string): void{
        switch (<PairingIds>id) {
            case PairingIds.AL_SWITCH_ON_OFF: {
                switch (value) {
                    case "1": {
                        this.emit("isOnChanged", true);
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                        break;
                    }
                    case "0": {
                        this.emit("isOnChanged", false);
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                        break;
                    }
                }
                break;
            }

            case PairingIds.AL_FORCED: {
                const val = parseInt(value);
                const isOn = (val & 1) > 0;
                const isForced = (val & 2) > 0
                this.emit("isOnChanged", isOn);
                this.emit("isForcedChanged", isForced);
                if (this.isAutoConfirm) {
                    this.setDatapoint(PairingIds.AL_INFO_FORCE, (isForced) ? "1" : "0");
                    this.setDatapoint(PairingIds.AL_INFO_ON_OFF, (isOn) ? "1" : "0");
                }
            }
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            switch (datapoint.pairingID) {
                case PairingIds.AL_INFO_ON_OFF:
                    this.emit("isOnChanged", ("1" === datapoint.value));
                    if (this.isAutoConfirm)
                        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, datapoint.value);
                    break;
            }
        }
    }
}