import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
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

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "WindowActuator");
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        const { preForcedPosition } = this;
        switch (<PairingIds>id) {
            case PairingIds.moveUpDown: {
                if (true === this.isForced)
                    break;
                if (true === this.isAutoConfirm)
                    this.isMoving = true;
                switch (value) {
                    case "1": {
                        this.emit("relativeValueChanged", 100);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, "100");
                            this.position = 100;
                        } else {
                            this.setDatapoint(PairingIds.infoMoveUpDown, "3");
                        }
                        break;
                    }
                    case "0": {
                        this.emit("relativeValueChanged", 0);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, "0");
                            this.position = 0;
                        } else {
                            this.setDatapoint(PairingIds.infoMoveUpDown, "2");
                        }
                        break;
                    }
                }

                break;
            }
            case PairingIds.adjustUpDown: {
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
                                this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, "100");
                                this.position = 100;
                                this.isMoving = true;
                            } else {
                                this.setDatapoint(PairingIds.infoMoveUpDown, "3");
                            }
                            break;
                        }
                        case "0": {
                            this.emit("relativeValueChanged", 0);
                            if (true === this.isAutoConfirm) {
                                this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, "0");
                                this.position = 0;
                                this.isMoving = true;
                            } else {
                                this.setDatapoint(PairingIds.infoMoveUpDown, "2");
                            }
                            break;

                        }
                    }
                }
                break;
            }
            case PairingIds.currentAbsolutePositionBlindsPercentage: // for scene playback
            case PairingIds.setAbsolutePositionBlinds: {
                if (true === this.isForced)
                    break;
                const position = parseInt(value);
                if (undefined === position)
                    break;
                if (true === this.isAutoConfirm) {
                    this.position = position;
                    this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, value);
                } else {
                    if (this.position <= position) {
                        this.setDatapoint(PairingIds.infoMoveUpDown, "3");
                    } else {
                        this.setDatapoint(PairingIds.infoMoveUpDown, "2");
                    }
                }
                this.emit("relativeValueChanged", position);
                break;
            }
            case PairingIds.forcePositionBlind: {
                this.setDatapoint(PairingIds.forcePositionInfo, value);
                switch (<ForcePositionBlind>value) {
                    case ForcePositionBlind.forceUp:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 0;
                        this.emit("relativeValueChanged", 0);
                        this.setDatapoint(PairingIds.infoError, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.forceDown:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 100;
                        this.emit("relativeValueChanged", 100);
                        this.setDatapoint(PairingIds.infoError, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.oldPositionAndOff:
                        this.emit("relativeValueChanged", preForcedPosition);
                        if (this.isAutoConfirm)
                            this.position = this.preForcedPosition;
                        this.setDatapoint(PairingIds.infoError, "0");
                        this.setDatapoint(PairingIds.forcePositionInfo, "0");
                        this.isForced = false;
                    case ForcePositionBlind.off:
                        this.setDatapoint(PairingIds.infoError, "0");
                        this.isForced = false;
                        break;
                }
                this.emit("isForcedChanged", this.isForced);
            }
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {
        const silentMode = (value === "02") ? true : false;
        this.emit("silentModeChanged", silentMode);
    }

    delegatePositionChanged(position: number): void {
        console.log(position);
        this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, position.toString());
        this.position = position;
    }

    delegateStateChanged(state: NodeState): void {
        const { freeAtHome } = this;
        if (state === NodeState.inactive)
            this.setDatapoint(PairingIds.infoMoveUpDown, "0");
    }

    delegateIsMovingChanged(isMoving: boolean): void {
        this.isMoving = isMoving;
        if (isMoving === false)
            this.setDatapoint(PairingIds.infoMoveUpDown, "0");
    }
}