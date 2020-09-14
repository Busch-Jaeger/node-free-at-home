import { FreeAtHomeApi, PairingIds, ParameterIds, VirtualDeviceType } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';

enum ForcePositionBlind {
    off = "0",
    oldPositionAndOff = "1",
    forceUp = "2",
    forceDown = "3",
}

export declare interface FreeAtHomeWindowActuatorDelegateInterface extends FreeAtHomeDelegateInterface {
    setRelativeValue(value: number): void;
    stopMovement(): void;
    setIsForced(isForced: boolean): void;

    setSilentMode(silentMode: boolean): void;

    on(event: 'positionChanged', listener: (position: number) => void): this;
    on(event: 'isMovingChanged', listener: (isMoving: boolean) => void): this;
}

export class FreeAtHomeWindowActuatorChannel implements FreeAtHomeChannelInterface {
    deviceType: VirtualDeviceType = "WindowActuator";
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    preForcedPosition: number;
    delegate: FreeAtHomeWindowActuatorDelegateInterface;

    position = 0;
    isMoving = false;
    isForced = false;
    isAutoConfirm: boolean;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWindowActuatorDelegateInterface, isAutoConfirm: boolean = false) {
        this.preForcedPosition = 0;
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.isAutoConfirm = isAutoConfirm;

        this.delegate = delegate;
        delegate.on("positionChanged", this.delegatePositionChanged.bind(this));
        delegate.on("isMovingChanged", this.delegateIsMovingChanged.bind(this));
    }

    setDatapoint(datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber, freeAtHome } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        const { delegate, preForcedPosition } = this;
        switch (<PairingIds>id) {
            case PairingIds.moveUpDown: {
                if (true === this.isForced)
                    break;
                if (true === this.isAutoConfirm)
                    this.isMoving = true;
                switch (value) {
                    case "1": {
                        delegate.setRelativeValue(100);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(PairingIds.currentAbsolutePositionBlindsPercentage, "100");
                            this.position = 100;
                        } else {
                            this.setDatapoint(PairingIds.infoMoveUpDown, "3");
                        }
                        break;
                    }
                    case "0": {
                        delegate.setRelativeValue(0);
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
                    delegate.stopMovement();
                    return;
                }
                else {
                    switch (value) {
                        case "1": {
                            delegate.setRelativeValue(100);
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
                            delegate.setRelativeValue(0);
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
                delegate.setRelativeValue(position);
                break;
            }
            case PairingIds.forcePositionBlind: {
                this.setDatapoint(PairingIds.forcePositionInfo, value);
                switch (<ForcePositionBlind>value) {
                    case ForcePositionBlind.forceUp:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 0;
                        delegate.setRelativeValue(0);
                        this.setDatapoint(PairingIds.infoError, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.forceDown:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 100;
                        delegate.setRelativeValue(100);
                        this.setDatapoint(PairingIds.infoError, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.oldPositionAndOff:
                        delegate.setRelativeValue(preForcedPosition);
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
                this.delegate.setIsForced(this.isForced);
            }
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {
        const silentMode = (value === "02") ? true : false;
        this.delegate.setSilentMode(silentMode);
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