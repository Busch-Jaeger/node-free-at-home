import { FreeAtHomeApi, DatapointIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { DeviceType } from '.';

export declare interface FreeAtHomeWeatherTemperatureSensorDelegateInterface extends FreeAtHomeDelegateInterface {

    on(event: 'temperatureChanged', listener: (position: number) => void): this;
}

export class FreeAtHomeWeatherTemperatureSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.weatherTemperatureSensor;
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeWeatherTemperatureSensorDelegateInterface;

    alertActivationLevel: number | undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWeatherTemperatureSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.alertActivationLevel = undefined

        this.delegate = delegate;

        delegate.on("temperatureChanged", this.delegateTemperatureChanged.bind(this));
    }

    delegateTemperatureChanged(temperature: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(freeAtHome, DatapointIds.outdoorTemperature, <string><unknown>temperature);
        console.log("new temperature %s", temperature);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel <= temperature)
                this.setDatapoint(freeAtHome, DatapointIds.frostAlarm, "1");
            else
                this.setDatapoint(freeAtHome, DatapointIds.frostAlarm, "0");
        }
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: DatapointIds, value: string) {
        const { channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

        switch (id) {
            case ParameterIds.brightnessAlertActivationLevel:
                this.alertActivationLevel = <number>parseInt(value);
                console.log("Parameter temperature alertActivationLevel changed %s", this.alertActivationLevel);
                break;
            case ParameterIds.hysteresis:
                break;
            case ParameterIds.alertActivationDelay:

                break;
            case ParameterIds.dealertActivationDelay:

                break;
            default:
                console.log("unexpected Parameter id: %s value: %s", id, value);
        }
    }
}
