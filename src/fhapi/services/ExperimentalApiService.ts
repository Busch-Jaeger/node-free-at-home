/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRestDevice_sysap__device_Get200ApplicationJsonResponse } from '../models/ApiRestDevice_sysap__device_Get200ApplicationJsonResponse';
import type { DeviceClass } from '../models/DeviceClass';
import type { NativeSerial } from '../models/NativeSerial';
import type { SysapUuid } from '../models/SysapUuid';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ExperimentalApiService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Trigger proxy device
     * Trigger proxy device
     * @param sysap SysAP UUID
     * @param deviceClass device class
     * @param device individual device ID
     * @param action action to execute
     * @returns ApiRestDevice_sysap__device_Get200ApplicationJsonResponse Success
     * @throws ApiError
     */
    public proxydevice(
        sysap: SysapUuid,
        deviceClass: DeviceClass,
        device: NativeSerial,
        action: 'shortpress' | 'doublepress',
    ): CancelablePromise<ApiRestDevice_sysap__device_Get200ApplicationJsonResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/proxydevice/{sysap}/{deviceClass}/{device}/action/{action}',
            path: {
                'sysap': sysap,
                'deviceClass': deviceClass,
                'device': device,
                'action': action,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

    /**
     * Set proxy device value
     * Set proxy device value
     * @param sysap SysAP UUID
     * @param deviceClass device class
     * @param device individual device ID
     * @param value value to be set
     * @returns ApiRestDevice_sysap__device_Get200ApplicationJsonResponse Success
     * @throws ApiError
     */
    public proxydeviceValue(
        sysap: SysapUuid,
        deviceClass: DeviceClass,
        device: NativeSerial,
        value: 'temperature' | 'alarm',
    ): CancelablePromise<ApiRestDevice_sysap__device_Get200ApplicationJsonResponse> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/rest/proxydevice/{sysap}/{deviceClass}/{device}/value/{value}',
            path: {
                'sysap': sysap,
                'deviceClass': deviceClass,
                'device': device,
                'value': value,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

}
