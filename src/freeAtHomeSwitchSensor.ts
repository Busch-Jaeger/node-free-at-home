import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    infoOnOffChanged(value: boolean);
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class FreeAtHomeSwitchSensorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "KNX-SwitchSensor");
    }

    onOffChanged(isOn: boolean): void {
        const { freeAtHome } = this;
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(PairingIds.AL_SWITCH_ON_OFF, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
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

    parameterChanged(id: ParameterIds, value: string): void {
    }

}