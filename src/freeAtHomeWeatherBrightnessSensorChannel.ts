import { FreeAtHomeApi, DatapointIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeWeatherBrightnessSensorDelegateInterface } from './freeAtHomeDeviceInterface';
import { DeviceType } from '.';

export class FreeAtHomeWeatherBrightnessSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.weatherBrightnessSensor;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeWeatherBrightnessSensorDelegateInterface;

    alertActivationLevel: number | undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, delegate: FreeAtHomeWeatherBrightnessSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.alertActivationLevel = undefined

        this.delegate = delegate;

        delegate.on("brightnessChanged", this.delegateBrightnessChanged.bind(this));
    }

    delegateBrightnessChanged(brightness: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(freeAtHome, DatapointIds.brightnessLevel, <string><unknown>brightness);
        console.log("new brightness %s", brightness);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel <= brightness)
                this.setDatapoint(freeAtHome, DatapointIds.brightnessAlarm, "1");
            else
                this.setDatapoint(freeAtHome, DatapointIds.brightnessAlarm, "0");
        }
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: DatapointIds, value: string) {
        const { delegate, channelNumber } = this;
        const nativeId = delegate.getSerialNumber();
        freeAtHome.setDatapoint(nativeId, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
    }

    parameterChanged(id: ParameterIds, value: string): void {

        switch (id) {
            case ParameterIds.brightnessAlertActivationLevel:
                this.alertActivationLevel = <number>parseInt(value);
                console.log("Parameter brightness changed %s", this.alertActivationLevel);
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