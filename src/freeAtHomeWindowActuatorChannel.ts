import { PairingIds, ParameterIds, Device } from './freeAtHomeApi';
import { NodeState } from './freeAtHomeDeviceInterface';

import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    relativeValueChanged(value: number): void;
    stopMovement(): void;
    isForcedChanged(isForced: boolean): void;

    silentModeChanged(silentMode: boolean): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

enum ForcePositionBlind {
    off = "0",
    oldPositionAndOff = "1",
    forceUp = "2",
    forceDown = "3",
}

export class FreeAtHomeWindowActuatorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    preForcedPosition: number = 0;

    position = 0;
    isMoving = false;
    isForced = false;

    constructor(device: Device, channelNumber: number){
        super(device, channelNumber);
        device.on("datapointChanged", this.dataPointChanged.bind(this));
        device.on("parameterChanged", this.parameterChanged.bind(this));
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
        const { preForcedPosition } = this;
        switch (<PairingIds>id) {
            case PairingIds.AL_MOVE_UP_DOWN: {
                if (true === this.isForced)
                    break;
                if (true === this.isAutoConfirm)
                    this.isMoving = true;
                switch (value) {
                    case "1": {
                        this.emit("relativeValueChanged", 100);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE, "100");
                            this.position = 100;
                        } else {
                            this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "3");
                        }
                        break;
                    }
                    case "0": {
                        this.emit("relativeValueChanged", 0);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE, "0");
                            this.position = 0;
                        } else {
                            this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "2");
                        }
                        break;
                    }
                }

                break;
            }
            case PairingIds.AL_STOP_STEP_UP_DOWN: {
                if (true === this.isForced)
                    break;
                if (true === this.isMoving) {
                    if (true === this.isAutoConfirm)
                        this.isMoving = false;
                    this.emit("stopMovement");
                    return;
                }
                else {
                    switch (value) {
                        case "1": {
                            this.emit("relativeValueChanged", 100);
                            if (true === this.isAutoConfirm) {
                                this.setDatapoint(PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE, "100");
                                this.position = 100;
                                this.isMoving = true;
                            } else {
                                this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "3");
                            }
                            break;
                        }
                        case "0": {
                            this.emit("relativeValueChanged", 0);
                            if (true === this.isAutoConfirm) {
                                this.setDatapoint(PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE, "0");
                                this.position = 0;
                                this.isMoving = true;
                            } else {
                                this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "2");
                            }
                            break;

                        }
                    }
                }
                break;
            }
            case PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE: // for scene playback
            case PairingIds.AL_SET_ABSOLUTE_POSITION_BLINDS_PERCENTAGE: {
                if (true === this.isForced)
                    break;
                const position = parseInt(value);
                if (undefined === position)
                    break;
                if (true === this.isAutoConfirm) {
                    this.position = position;
                    this.setDatapoint(PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE, value);
                } else {
                    if (this.position <= position) {
                        this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "3");
                    } else {
                        this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "2");
                    }
                }
                this.emit("relativeValueChanged", position);
                break;
            }
            case PairingIds.AL_FORCED_UP_DOWN: {
                this.setDatapoint(PairingIds.AL_INFO_FORCE, value);
                switch (<ForcePositionBlind>value) {
                    case ForcePositionBlind.forceUp:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 0;
                        this.emit("relativeValueChanged", 0);
                        this.setDatapoint(PairingIds.AL_INFO_ERROR, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.forceDown:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 100;
                        this.emit("relativeValueChanged", 100);
                        this.setDatapoint(PairingIds.AL_INFO_ERROR, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.oldPositionAndOff:
                        this.emit("relativeValueChanged", preForcedPosition);
                        if (this.isAutoConfirm)
                            this.position = this.preForcedPosition;
                        this.setDatapoint(PairingIds.AL_INFO_ERROR, "0");
                        this.setDatapoint(PairingIds.AL_INFO_FORCE, "0");
                        this.isForced = false;
                    case ForcePositionBlind.off:
                        this.setDatapoint(PairingIds.AL_INFO_ERROR, "0");
                        this.isForced = false;
                        break;
                }
                this.emit("isForcedChanged", this.isForced);
            }
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
        const silentMode = (value === "02") ? true : false;
        this.emit("silentModeChanged", silentMode);
    }

    setPosition(position: number): void {
        console.log(position);
        this.setDatapoint(PairingIds.AL_CURRENT_ABSOLUTE_POSITION_BLINDS_PERCENTAGE, position.toString());
        this.position = position;
    }

    setState(state: NodeState): void {
        if (state === NodeState.inactive)
            this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "0");
    }

    setIsMoving(isMoving: boolean): void {
        this.isMoving = isMoving;
        if (isMoving === false)
            this.setDatapoint(PairingIds.AL_INFO_MOVE_UP_DOWN, "0");
    }
}