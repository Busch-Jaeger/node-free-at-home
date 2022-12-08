/**
 * free@home serial port API
 * v1
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@busch-jaeger/oazapfts_runtime/lib/runtime";
import * as QS from "@busch-jaeger/oazapfts_runtime/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "/",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    server1: "/",
    server2: ({ hostname = "192.168.2.1" }: {
        hostname: string | number | boolean;
    }) => `https://${hostname}`
};
export type Device = {
    sysName: string;
    vID?: string;
    pID?: string;
    serialNumber?: string;
};
export type Devices = Device[];
/**
 * Get serial devices connected to the System Access Point
 */
export function getSettings(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Devices;
    }>("/devices", {
        ...opts
    });
}
