import { DatapointIds, ParameterIds, FreeAtHomeApi, DeviceType } from "./freeAtHomeApi"

export declare interface FreeAtHomeDelegateInterface {
}

export enum NodeState {
    inactive = 0,
    active,
}

export declare interface FreeAtHomeOnOffDelegateInterface extends FreeAtHomeDelegateInterface {
    setOn(value: boolean): void;
}

export declare interface FreeAtHomeWeatherBrightnessSensorDelegateInterface extends FreeAtHomeDelegateInterface {

    on(event: 'brightnessChanged', listener: (position: number) => void): this;
}

export declare interface FreeAtHomeRawDelegateInterface extends FreeAtHomeDelegateInterface {
    dataPointChanged(channel: number, id: DatapointIds, value: string): void;
    parameterChanged(id: ParameterIds, value: string): void;

    on(event: 'datapointChanged', listener: (datapointId: DatapointIds, value: string) => void): this;
}

export declare interface FreeAtHomeChannelInterface {
    delegate: FreeAtHomeDelegateInterface;
    freeAtHome: FreeAtHomeApi;
    deviceType: DeviceType;

    serialNumber: string;
    name: string;

    dataPointChanged(channel: number, id: DatapointIds, value: string): void;
    parameterChanged(id: ParameterIds, value: string): void;
}
