/**
 * free@home internal settings API
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
export type Reference = string;
/**
 * upload auxiliary device data
 */
export function uploadAuxiliaryDeviceData(reference: Reference, body?: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/${reference}/pushData`, {
        ...opts,
        method: "POST",
        body
    });
}
