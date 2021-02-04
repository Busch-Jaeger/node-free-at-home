/**
 * free@home API
 * v1
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts_runtime/lib/runtime";
import * as QS from "oazapfts_runtime/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "https://192.168.2.1/fhapi/v1",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    server1: ({ hostname = "192.168.2.1" }: {
        hostname: string | number | boolean;
    }) => `https://${hostname}/fhapi/v1`
};
export type InOutPut = {
    pairingID?: number;
    value?: string;
};
export type Channel = {
    displayName?: string;
    functionID?: string;
    room?: string;
    floor?: string;
    inputs?: {
        [key: string]: InOutPut;
    };
    outputs?: {
        [key: string]: InOutPut;
    };
    "type"?: string;
};
export type Device = {
    displayName?: string;
    room?: string;
    floor?: string;
    "interface"?: string;
    nativeId?: string;
    channels?: {
        [key: string]: Channel;
    };
};
export type Devices = {
    [key: string]: Device;
};
export type Rooms = {
    [key: string]: {
        name?: string;
    };
};
export type Floors = {
    [key: string]: {
        name?: string;
        rooms?: Rooms;
    };
};
export type Users = {
    [key: string]: {
        enabled?: boolean;
        flags?: string[];
        grantedPermissions?: string[];
        jid?: string;
        name?: string;
        requestedPermissions?: string[];
        role?: string;
    };
};
export type Error = {
    code?: string;
    detail?: string;
    title?: string;
} | null;
export type SysAP = {
    devices?: Devices;
    floorplan?: {
        floors?: Floors;
    };
    sysapName?: string;
    users?: Users;
    error?: Error;
};
export type Configuration = {
    [key: string]: SysAP;
};
export type Devicelist = {
    [key: string]: string[];
};
export type SysapUuid = string;
export type DeviceSerial = string;
export type ApiRestDevice_sysap__device_Get200ApplicationJsonResponse = {
    [key: string]: {
        devices?: Devices;
    };
};
export type ChannelSerial = string;
export type DatapointSerial = string;
export type ApiRestDatapoint_sysap__serial_Get200ApplicationJsonResponse = {
    [key: string]: {
        values?: string[];
    };
};
export type ApiRestDatapoint_sysap__serial_Put200TextPlainResponse = object;
export type WebsocketMessage = {
    [key: string]: {
        datapoints: {
            [key: string]: string;
        };
        devices: {
            [key: string]: Devices;
        };
        devicesAdded: string[];
        devicesRemoved: string[];
        scenesTriggered: object;
    };
};
export type NativeSerial = string;
export type VirtualDeviceType = "BinarySensor" | "BlindActuator" | "SwitchingActuator" | "CeilingFanActuator" | "RTC" | "DimActuator" | "evcharging" | "WindowSensor" | "simple_doorlock" | "ShutterActuator" | "WeatherStation" | "Weather-TemperatureSensor" | "Weather-WindSensor" | "Weather-BrightnessSensor" | "Weather-RainSensor" | "WindowActuator" | "CODetector" | "FireDetector" | "KNX-SwitchSensor" | "MediaPlayer";
export type VirtualDevice = {
    "type"?: VirtualDeviceType;
    properties?: {
        ttl?: string;
        displayname?: string;
    };
};
export type VirtualDevicesSuccess = {
    [key: string]: {
        devices?: {
            [key: string]: {
                serial?: string;
            };
        };
    };
};
/**
 * Get configuration
 */
export function getconfiguration(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Configuration;
    } | {
        status: 401;
    } | {
        status: 502;
        data: string;
    }>("/api/rest/configuration", {
        ...opts
    });
}
/**
 * Get devicelist
 */
export function getdevicelist(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Devicelist;
    } | {
        status: 401;
    } | {
        status: 502;
        data: string;
    }>("/api/rest/devicelist", {
        ...opts
    });
}
/**
 * Get device
 */
export function getdevice(sysap: SysapUuid, device: DeviceSerial, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: ApiRestDevice_sysap__device_Get200ApplicationJsonResponse;
    } | {
        status: 401;
    } | {
        status: 502;
        data: string;
    }>(`/api/rest/device/${sysap}/${device}`, {
        ...opts
    });
}
/**
 * Get datapoint value
 */
export function getdatapoint(sysap: SysapUuid, device: DeviceSerial, channel: ChannelSerial, datapoint: DatapointSerial, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: ApiRestDatapoint_sysap__serial_Get200ApplicationJsonResponse;
    } | {
        status: 401;
    }>(`/api/rest/datapoint/${sysap}/${device}.${channel}.${datapoint}`, {
        ...opts
    });
}
/**
 * Set datapoint value
 */
export function putdatapoint(sysap: SysapUuid, device: DeviceSerial, channel: ChannelSerial, datapoint: DatapointSerial, body: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: ApiRestDatapoint_sysap__serial_Put200TextPlainResponse;
    } | {
        status: 401;
    } | {
        status: 502;
        data: string;
    }>(`/api/rest/datapoint/${sysap}/${device}.${channel}.${datapoint}`, {
        ...opts,
        method: "PUT",
        body
    });
}
/**
 * Websocket connection
 */
export function ws(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 101;
        data: WebsocketMessage;
    } | {
        status: 401;
    }>("/api/ws", {
        ...opts
    });
}
/**
 * Create virtual device
 */
export function putApiRestVirtualdeviceBySysapAndSerial(sysap: SysapUuid, serial: NativeSerial, virtualDevice: VirtualDevice, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: VirtualDevicesSuccess;
    } | {
        status: 401;
    } | {
        status: 502;
    }>(`/api/rest/virtualdevice/${sysap}/${serial}`, oazapfts.json({
        ...opts,
        method: "PUT",
        body: virtualDevice
    }));
}
