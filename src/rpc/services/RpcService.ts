/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Reference } from '../models/Reference';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class RpcService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * upload auxiliary device data
     * Push
     * @param reference hash of commit sha256
     * @param requestBody New value
     * @returns any Success
     * @throws ApiError
     */
    public uploadAuxiliaryDeviceData(
        reference: Reference,
        requestBody?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/{reference}/pushData',
            path: {
                'reference': reference,
            },
            body: requestBody,
            mediaType: 'text/plain',
            errors: {
                401: `Authentication information is missing or invalid`,
                413: `Payload Too Large error`,
                502: `Bad Gateway error`,
            },
        });
    }

}
