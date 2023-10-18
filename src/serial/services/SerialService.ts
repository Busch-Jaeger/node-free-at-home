/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Devices } from '../models/Devices';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class SerialService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get serial devices connected to the System Access Point
     * @returns Devices Success
     * @throws ApiError
     */
    public getSettings(): CancelablePromise<Devices> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/devices',
        });
    }

}
