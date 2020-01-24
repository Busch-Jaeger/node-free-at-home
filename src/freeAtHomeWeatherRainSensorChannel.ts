import { FreeAtHomeApi, DatapointIds, ParameterIds } from './freeAtHomeApi';
import { FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { DeviceType } from '.';

export declare interface FreeAtHomeWeatherRainSensorDelegateInterface extends FreeAtHomeDelegateInterface {

    on(event: 'isRainingChanged', listener: (isRaining: boolean) => void): this;
}

export class freeAtHomeWeatherRainSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.weatherRainSensor;
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeWeatherRainSensorDelegateInterface;

    alertActivationLevel: number | undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWeatherRainSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;

        this.delegate = delegate;

        delegate.on("isRainingChanged", this.delegateIsRainingChanged.bind(this));
    }

    delegateIsRainingChanged(isRaining: boolean): void {
        const { freeAtHome } = this;
        const value = (true === isRaining) ? "1" : "0";
        this.setDatapoint(DatapointIds.rainAlarm, value);
    }

    setDatapoint(datapointId: DatapointIds, value: string) {
        const { channelNumber, serialNumber, freeAtHome } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {
    }
}
