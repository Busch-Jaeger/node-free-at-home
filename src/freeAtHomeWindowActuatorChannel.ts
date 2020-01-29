import { FreeAtHomeApi, DatapointIds, ParameterIds, DeviceType } from './freeAtHomeApi';
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

    getPostition(): number;
    getState(): NodeState;
    setSilentMode(silentMode: boolean): void;

    on(event: 'positionChanged', listener: (position: number) => void): this;
    on(event: 'stateChanged', listener: (state: NodeState) => void): this;
}

export class FreeAtHomeWindowActuatorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.windowActuator;
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    preForcedPosition: number;
    delegate: FreeAtHomeWindowActuatorDelegateInterface;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWindowActuatorDelegateInterface) {
        this.preForcedPosition = 0;
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;

        this.delegate = delegate;
        delegate.on("positionChanged", this.delegatePositionChanged.bind(this));
        delegate.on("stateChanged", this.delegateStateChanged.bind(this));
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: DatapointIds, value: string) {
        const { channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
        const { delegate, preForcedPosition, freeAtHome } = this;

        switch (<DatapointIds>id) {
            case DatapointIds.moveUpDown: {
                switch (value) {
                    case "1": {
                        delegate.setRelativeValue(100);
                        this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "3");
                        break;
                    }
                    case "0": {
                        delegate.setRelativeValue(0);
                        this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "2");
                        break;
                    }
                }
                break;
            }
            case DatapointIds.adjustUpDown: {
                if (delegate.getState() === NodeState.active) {
                    delegate.stopMovement();
                }
                else {
                    switch (value) {
                        case "1": {
                            delegate.setRelativeValue(100);
                            this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "3");
                            break;
                        }
                        case "0": {
                            delegate.setRelativeValue(0);
                            this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "2");
                            break;
                        }
                    }
                }
                break;
            }
            case DatapointIds.currentAbsolutePositionBlindsPercentage:
            case DatapointIds.setAbsolutePositionBlinds: {
                if (delegate.getPostition() <= <number><unknown>value) {
                    this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "3");
                } else {
                    this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "2");
                }
                delegate.setRelativeValue(<number><unknown>value);
                this.setDatapoint(freeAtHome, DatapointIds.currentAbsolutePositionBlindsPercentage, value);
                break;
            }
            case DatapointIds.forcePositionBlind: {
                this.setDatapoint(freeAtHome, DatapointIds.forcePositionInfo, value);
                switch (<ForcePositionBlind>value) {
                    case ForcePositionBlind.forceUp:
                        this.preForcedPosition = delegate.getPostition();
                        delegate.setRelativeValue(0);
                        this.setDatapoint(freeAtHome, DatapointIds.infoError, "32");
                        break;
                    case ForcePositionBlind.forceDown:
                        this.preForcedPosition = delegate.getPostition();
                        delegate.setRelativeValue(100);
                        this.setDatapoint(freeAtHome, DatapointIds.infoError, "32");
                        break;
                    case ForcePositionBlind.oldPositionAndOff:
                        delegate.setRelativeValue(preForcedPosition);
                        this.setDatapoint(freeAtHome, DatapointIds.infoError, "0");
                        this.setDatapoint(freeAtHome, DatapointIds.forcePositionInfo, "0");
                    case ForcePositionBlind.off:
                        this.setDatapoint(freeAtHome, DatapointIds.infoError, "0");
                        break;
                }
            }
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {
        const { freeAtHome } = this;
        const silentMode = (value === "02") ? true : false;
        this.delegate.setSilentMode(silentMode);
    }

    delegatePositionChanged(position: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(freeAtHome, DatapointIds.currentAbsolutePositionBlindsPercentage, <string><unknown>position);
    }

    delegateStateChanged(state: NodeState): void {
        const { freeAtHome } = this;
        if (state === NodeState.inactive)
            this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "0");
    }
}