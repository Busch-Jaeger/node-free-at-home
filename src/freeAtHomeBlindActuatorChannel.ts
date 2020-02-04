import { FreeAtHomeApi, DatapointIds, ParameterIds, DeviceType } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';

enum ForcePositionBlind {
    off = "0",
    oldPositionAndOff = "1",
    forceUp = "2",
    forceDown = "3",
}

export declare interface FreeAtHomeBlindActuatorDelegateInterface extends FreeAtHomeDelegateInterface {
    setRelativeValue(value: number): void;
    stopMovement(): void;
    setIsForced(isForced: boolean): void;

    setSilentMode(silentMode: boolean): void;

    on(event: 'positionChanged', listener: (position: number) => void): this;
    on(event: 'isMoveingChanged', listener: (isMoveing: boolean) => void): this;
}

export class FreeAtHomeBlindActuatorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.blindActuator;
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    preForcedPosition: number;
    delegate: FreeAtHomeBlindActuatorDelegateInterface;

    position = 0;
    isMoveing = false;
    isForced = false;
    isAutoConfirm: boolean;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeBlindActuatorDelegateInterface, isAutoConfirm: boolean = false) {
        this.preForcedPosition = 0;
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.isAutoConfirm = isAutoConfirm;

        this.delegate = delegate;
        delegate.on("positionChanged", this.delegatePositionChanged.bind(this));
        // delegate.on("stateChanged", this.delegateStateChanged.bind(this));
        delegate.on("isMoveingChanged", this.delegateIsMoveingChanged.bind(this));
    }

    setDatapoint(datapointId: DatapointIds, value: string) {
        const { channelNumber, serialNumber, freeAtHome } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
        const { delegate, preForcedPosition } = this;
        switch (<DatapointIds>id) {
            case DatapointIds.moveUpDown: {
                if (true === this.isForced)
                    break;
                if (true === this.isAutoConfirm)
                    this.isMoveing = true;
                switch (value) {
                    case "1": {
                        delegate.setRelativeValue(100);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(DatapointIds.currentAbsolutePositionBlindsPercentage, "100");
                            this.position = 100;
                        } else {
                            this.setDatapoint(DatapointIds.infoMoveUpDown, "3");
                        }
                        break;
                    }
                    case "0": {
                        delegate.setRelativeValue(0);
                        if (true === this.isAutoConfirm) {
                            this.setDatapoint(DatapointIds.currentAbsolutePositionBlindsPercentage, "0");
                            this.position = 0;
                        } else {
                            this.setDatapoint(DatapointIds.infoMoveUpDown, "2");
                        }
                        break;
                    }
                }

                break;
            }
            case DatapointIds.adjustUpDown: {
                if (true === this.isForced)
                    break;
                if (true === this.isMoveing) {
                    if (true === this.isAutoConfirm)
                        this.isMoveing = false;
                    delegate.stopMovement();
                    return;
                }
                else {
                    switch (value) {
                        case "1": {
                            delegate.setRelativeValue(100);
                            if (true === this.isAutoConfirm) {
                                this.setDatapoint(DatapointIds.currentAbsolutePositionBlindsPercentage, "100");
                                this.position = 100;
                                this.isMoveing = true;
                            } else {
                                this.setDatapoint(DatapointIds.infoMoveUpDown, "3");
                            }
                            break;
                        }
                        case "0": {
                            delegate.setRelativeValue(0);
                            if (true === this.isAutoConfirm) {
                                this.setDatapoint(DatapointIds.currentAbsolutePositionBlindsPercentage, "0");
                                this.position = 0;
                                this.isMoveing = true;
                            } else {
                                this.setDatapoint(DatapointIds.infoMoveUpDown, "2");
                            }
                            break;

                        }
                    }
                }
                break;
            }
            case DatapointIds.currentAbsolutePositionBlindsPercentage: // for scene playback
            case DatapointIds.setAbsolutePositionBlinds: {
                if (true === this.isForced)
                    break;
                const position = parseInt(value);
                if (undefined === position)
                    break;
                if (true === this.isAutoConfirm) {
                    this.position = position;
                    this.setDatapoint(DatapointIds.currentAbsolutePositionBlindsPercentage, value);
                } else {
                    if (this.position <= position) {
                        this.setDatapoint(DatapointIds.infoMoveUpDown, "3");
                    } else {
                        this.setDatapoint(DatapointIds.infoMoveUpDown, "2");
                    }
                }
                delegate.setRelativeValue(position);
                break;
            }
            case DatapointIds.forcePositionBlind: {
                this.setDatapoint(DatapointIds.forcePositionInfo, value);
                switch (<ForcePositionBlind>value) {
                    case ForcePositionBlind.forceUp:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 0;
                        delegate.setRelativeValue(0);
                        this.setDatapoint(DatapointIds.infoError, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.forceDown:
                        this.preForcedPosition = this.position;
                        if (this.isAutoConfirm)
                            this.position = 100;
                        delegate.setRelativeValue(100);
                        this.setDatapoint(DatapointIds.infoError, "32");
                        this.isForced = true;
                        break;
                    case ForcePositionBlind.oldPositionAndOff:
                        delegate.setRelativeValue(preForcedPosition);
                        if (this.isAutoConfirm)
                            this.position = this.preForcedPosition;
                        this.setDatapoint(DatapointIds.infoError, "0");
                        this.setDatapoint(DatapointIds.forcePositionInfo, "0");
                        this.isForced = false;
                    case ForcePositionBlind.off:
                        this.setDatapoint(DatapointIds.infoError, "0");
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
        this.setDatapoint(DatapointIds.currentAbsolutePositionBlindsPercentage, position.toString());
        this.position = position;
    }

    delegateStateChanged(state: NodeState): void {
        const { freeAtHome } = this;
        if (state === NodeState.inactive)
            this.setDatapoint(DatapointIds.infoMoveUpDown, "0");
    }

    delegateIsMoveingChanged(isMoveing: boolean): void {
        this.isMoveing = isMoveing;
        if (isMoveing === false)
            this.setDatapoint(DatapointIds.infoMoveUpDown, "0");
    }
}