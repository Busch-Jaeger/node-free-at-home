import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { Datapoint } from '..';

interface ChannelEvents {
    isOnChanged(value: boolean): void;
    changeOperation(): void
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class HomeApplianceChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {

    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
    }

    setOn(isOn: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, (isOn) ? "1" : "0");
    }

    setStatus(status: number) {
        this.setDatapoint(PairingIds.AL_INFO_STATUS, status.toString());
    }

    setVerboseStatus(status: string) {
        this.setDatapoint(PairingIds.AL_INFO_VERBOSE_STATUS, status);
    }

    setDoorOpen(isOpen: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_DOOR, (isOpen) ? "1" : "0");
    }

    setCurrentTemperature(tmp: number) {
        this.setDatapoint(PairingIds.AL_CURRENT_TEMPERATURE_APPLIANCE_1, tmp.toString())
    }

    setCurrentTemperatureInvalid() {
        this.setDatapoint(PairingIds.AL_CURRENT_TEMPERATURE_APPLIANCE_1, "invalid")
    }

    setSetPointTemperature(tmp: number) {
        this.setDatapoint(PairingIds.AL_SETPOINT_TEMPERATURE_APPLIANCE_1, tmp.toString())
    }

    setSetPointTemperatureInvalid() {
        this.setDatapoint(PairingIds.AL_SETPOINT_TEMPERATURE_APPLIANCE_1, "invalid")
    }

    protected dataPointChanged(id: PairingIds, value: string): void{
        switch (id) {
            case PairingIds.AL_SWITCH_ON_OFF: {
                switch (value) {
                    case "1": {
                        this.emit("isOnChanged", true);
                        if (this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                        }
                        break;
                    }
                    case "0": {
                        this.emit("isOnChanged", false);
                        if (this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                        }
                        break;
                    }
                }
                break;
            }
            case PairingIds.AL_CHANGE_OPERATION:
                this.emit('changeOperation')
                break;
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            switch (datapoint.pairingID) {
                case PairingIds.AL_INFO_ON_OFF:
                    this.emit("isOnChanged", ("1" === datapoint.value));
                    if (this.isAutoConfirm) {
                        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, datapoint.value);
                    }
                    break;

                case PairingIds.AL_CHANGE_OPERATION:
                    this.emit('changeOperation')
                    break;

            }
        }
    }
}
