import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { VirtualDeviceType } from '.';

export declare interface FreeAtHomeWeatherRainSensorDelegateInterface extends FreeAtHomeDelegateInterface {

    on(event: 'isRainingChanged', listener: (isRaining: boolean) => void): this;
}

export class freeAtHomeWeatherRainSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: VirtualDeviceType = "Weather-RainSensor";
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
        this.setDatapoint(PairingIds.rainAlarm, value);
    }

    setDatapoint(datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber, freeAtHome } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {
    }
}
