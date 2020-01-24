import { FreeAtHomeApi, DatapointIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { DeviceType } from '.';

export enum WindowState {
    closed,
    tilted,
    opened,
}

export declare interface FreeAtHomeWindowSensorDelegateInterface extends FreeAtHomeDelegateInterface {

    on(event: 'windowStateChanged', listener: (state: WindowState) => void): this;
}

export class FreeAtHomeWindowSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.windowSensor;
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeWindowSensorDelegateInterface;

    alertActivationLevel: number | undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWindowSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.alertActivationLevel = undefined

        this.delegate = delegate;

        delegate.on("windowStateChanged", this.delegateWindowStateChanged.bind(this));
    }

    delegateWindowStateChanged(state: WindowState): void {
        switch (state) {
            case WindowState.closed:
                this.setDatapoint(DatapointIds.windowDoor, "0");
                this.setDatapoint(DatapointIds.windowDoorPosition, "0");
                break;
            case WindowState.tilted:
                this.setDatapoint(DatapointIds.windowDoor, "1");
                this.setDatapoint(DatapointIds.windowDoorPosition, "1");
                break;
            case WindowState.opened:
                this.setDatapoint(DatapointIds.windowDoor, "1");
                this.setDatapoint(DatapointIds.windowDoorPosition, "0");
                break;
            default:
                console.error("unknown window state: %s", state);
        }
    }

    setDatapoint(datapointId: DatapointIds, value: string) {
        const { freeAtHome, channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

    }
}
