import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeWeatherBrightnessSensorDelegateInterface } from './freeAtHomeDeviceInterface';
import { VirtualDeviceType } from '.';

export class FreeAtHomeWeatherBrightnessSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: VirtualDeviceType = "Weather-BrightnessSensor";
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeWeatherBrightnessSensorDelegateInterface;

    alertActivationLevel: number | undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWeatherBrightnessSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.alertActivationLevel = undefined

        this.delegate = delegate;

        delegate.on("brightnessChanged", this.delegateBrightnessChanged.bind(this));
    }

    delegateBrightnessChanged(brightness: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(freeAtHome, PairingIds.brightnessLevel, <string><unknown>brightness);
        console.log("new brightness %s", brightness);

        if (this.alertActivationLevel !== undefined) {
            if (this.alertActivationLevel <= brightness)
                this.setDatapoint(freeAtHome, PairingIds.brightnessAlarm, "1");
            else
                this.setDatapoint(freeAtHome, PairingIds.brightnessAlarm, "0");
        }
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
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