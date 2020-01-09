import { FreeAtHomeApi, DatapointIds, ParameterIds, DeviceType } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeBlindDelegateInterface } from './freeAtHomeDeviceInterface';

enum ForcePositionBlind {
    off = "0",
    oldPositionAndOff = "1",
    forceUp = "2",
    forceDown = "3",
}

export class FreeAtHomeBlindChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.blindActuator
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    preForcedPosition: number;
    delegate: FreeAtHomeBlindDelegateInterface;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, delegate: FreeAtHomeBlindDelegateInterface) {
        this.preForcedPosition = 0;
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;

        this.delegate = delegate;
        delegate.on("positionChanged", this.delegatePositionChanged.bind(this));
        delegate.on("stateChanged", this.delegateStateChanged.bind(this));
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: DatapointIds, value: string) {
        const { delegate, channelNumber } = this;
        const nativeId = delegate.getSerialNumber();
        freeAtHome.setDatapoint(nativeId, channelNumber, datapointId, value);
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

        console.log(position);
        this.setDatapoint(freeAtHome, DatapointIds.currentAbsolutePositionBlindsPercentage, <string><unknown>position);
    }

    delegateStateChanged(state: NodeState): void {
        const { freeAtHome } = this;
        if (state === NodeState.inactive)
            this.setDatapoint(freeAtHome, DatapointIds.infoMoveUpDown, "0");
    }
}