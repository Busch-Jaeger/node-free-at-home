import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { VirtualDeviceType } from '.';


export declare interface FreeAtHomeSwitchSensorDelegateInterface extends FreeAtHomeDelegateInterface {
    setInfoOnOff(value: boolean): void;
    on(event: 'onOffChanged', listener: (isOn: boolean) => void): this;
}

export class FreeAtHomeSwitchSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: VirtualDeviceType = "KNX-SwitchSensor";
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeSwitchSensorDelegateInterface;


    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeSwitchSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;

        this.delegate = delegate;

        delegate.on("onOffChanged", this.delegateOnOffChanged.bind(this));
    }

    delegateOnOffChanged(isOn: boolean): void {
        const { freeAtHome } = this;
        const value = (true === isOn) ? "1" : "0";
        this.setDatapoint(freeAtHome, PairingIds.switchOnOff, value);
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        const { delegate } = this;
        switch (<PairingIds>id) {
            case PairingIds.infoOnOff: {
                switch (value) {
                    case "1": {
                        delegate.setInfoOnOff(true);
                        break;
                    }
                    case "0": {
                        delegate.setInfoOnOff(false);
                        break;
                    }
                }
                break;
            }
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {

        // switch (id) {
        //     case ParameterIds.brightnessAlertActivationLevel:
        //         this.alertActivationLevel = <number>parseInt(value);
        //         console.log("Parameter brightness changed %s", this.alertActivationLevel);
        //         break;
        //     case ParameterIds.hysteresis:
        //         break;
        //     case ParameterIds.alertActivationDelay:

        //         break;
        //     case ParameterIds.dealertActivationDelay:

        //         break;
        //     default:
        //         console.log("unexpected Parameter id: %s value: %s", id, value);
        // }
    }
}