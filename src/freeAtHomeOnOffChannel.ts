import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    isOnChanged(value: boolean);
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class FreeAtHomeOnOffChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "SwitchingActuator");
    }

    setOn(isOn: boolean) {
        this.setDatapoint(PairingIds.infoOnOff, (isOn) ? "1" : "0");
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        const { freeAtHome } = this;

        switch (<PairingIds>id) {
            case PairingIds.switchOnOff: {
                switch (value) {
                    case "1": {
                        this.emit("isOnChanged", true);
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.infoOnOff, value);
                        break;
                    }
                    case "0": {
                        this.emit("isOnChanged", false);
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.infoOnOff, value);
                        break;
                    }
                }
                break;
            }
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {
    }
}