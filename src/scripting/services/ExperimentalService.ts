/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Reference } from '../models/Reference';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ExperimentalService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * queue an add-on url for download
     * queue an add-on url for download
     * @param requestBody
     * @returns Reference Success
     * @throws ApiError
     */
    public queueDownload(
        requestBody?: string,
    ): CancelablePromise<Reference> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/downloadqueue',
            body: requestBody,
            mediaType: 'text/plain',
            errors: {
                400: `Bad Request`,
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

}
