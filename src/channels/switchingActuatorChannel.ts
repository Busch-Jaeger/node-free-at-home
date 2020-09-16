import { PairingIds, ParameterIds, Device } from '../freeAtHomeApi';
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    isOnChanged(value: boolean);
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class SwitchingActuatorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(device: Device, channelNumber: number){
        super(device, channelNumber);
        device.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    setOn(isOn: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, (isOn) ? "1" : "0");
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
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }
}