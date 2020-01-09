import { FreeAtHomeApi, DatapointIds, ParameterIds } from './freeAtHomeApi';
import { FreeAtHomeChannelInterface, FreeAtHomeRawDelegateInterface } from './freeAtHomeDeviceInterface';
import { DeviceType } from '.';

export class FreeAtHomeRawChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeRawDelegateInterface;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, delegate: FreeAtHomeRawDelegateInterface, ) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.deviceType = delegate.getDeviceType();

        this.delegate = delegate;

        delegate.on("datapointChanged", this.delegateDatapointChanged.bind(this));
    }

    delegateDatapointChanged(datapointId: DatapointIds, value: string): void {
        const { delegate, channelNumber } = this;
        const nativeId = delegate.getSerialNumber();
        this.freeAtHome.setDatapoint(nativeId, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
        const { delegate } = this;
        console.log("lajflajslf %s %s", channel, id);
        delegate.dataPointChanged(channel, id, value);
    }

    parameterChanged(id: ParameterIds, value: string): void {
        const { delegate } = this;
        console.log("debug: %s %s", id, value);
        delegate.parameterChanged(id, value);
    }
}