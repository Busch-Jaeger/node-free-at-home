import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { VirtualDeviceType } from '.';

export declare interface FreeAtHomeWeatherWindSensorDelegateInterface extends FreeAtHomeDelegateInterface {

    on(event: 'windSpeedChanged', listener: (windSpeed: number) => void): this;
}

import './utilities';

const windAlarmLevels = [
    0,    //  0
    0.3,  //  1
    1.6,  //  2
    3.4,  //  3
    5.5,  //  4
    8.0,  //  5
    10.8, //  6
    13.9, //  7
    17.2, //  8
    20.8, //  9
    24.5, // 10
    28.5, // 11
    32.7, // 12
]

export class FreeAtHomeWeatherWindSensorChannel implements FreeAtHomeChannelInterface {
    deviceType: VirtualDeviceType = "Weather-WindSensor";
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeWeatherWindSensorDelegateInterface;

    windAlarmLevel: number | undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeWeatherWindSensorDelegateInterface) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.windAlarmLevel = undefined

        this.delegate = delegate;

        delegate.on("windSpeedChanged", this.delegateWindSpeedChanged.bind(this));
    }

    delegateWindSpeedChanged(windSpeed: number): void {
        const { freeAtHome } = this;
        this.setDatapoint(freeAtHome, PairingIds.windSpeed, <string><unknown>windSpeed);

        const alarmLevel = windAlarmLevels.binaryIndexOf(windSpeed);
        console.log("wind alarm level: %s", alarmLevel);
        this.setDatapoint(freeAtHome, PairingIds.windForce, <string><unknown>alarmLevel);

        if (this.windAlarmLevel !== undefined) {
            if (this.windAlarmLevel <= alarmLevel) {
                this.setDatapoint(freeAtHome, PairingIds.windAlarm, "1");
            } else {
                this.setDatapoint(freeAtHome, PairingIds.windAlarm, "0");
            }
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
            case ParameterIds.windForce:
                this.windAlarmLevel = <number>parseInt(value);
                console.log("Parameter temperature alertActivationLevel changed %s", this.windAlarmLevel);
                break;

            default:
                console.log("unexpected Parameter id: %s value: %s", id, value);
        }
    }
}
