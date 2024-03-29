import { FreeAtHomeApi, PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    infoOnOffChanged(value: boolean): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class SwitchSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
    }

    onOffChanged(isOn: boolean): void {
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_SWITCH_ON_OFF, value);
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {
            case PairingIds.AL_INFO_ON_OFF: {
                switch (value) {
                    case "1": {
                        this.emit("infoOnOffChanged", true);
                        break;
                    }
                    case "0": {
                        this.emit("infoOnOffChanged", true);
                        break;
                    }
                }
                break;
            }
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

}