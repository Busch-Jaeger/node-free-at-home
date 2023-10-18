/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DefaultService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Websocket connection
     * This endpoint is used to open a websocket connection. In order to use this endpoint, you must use a websocket implementation and use the "wss://" protocol schema instead of "https",a normal http request on this URL will fail.
     *
     * When the websocket has been opened successfully, the client will receive events from the free@home cloud for all registered SysAPs in the account of the requester.
     *
     * Also note that this call can NOT be tested by using the swagger ui frontend (the "Try it" button). You must use a websocket implementation for this request, the portal does not support this. See the [websocket section](https://developer.eu.mybuildings.abb.com/fah_cloud/concepts/#websocket) in the documentation for an example.
     * @returns void
     * @throws ApiError
     */
    public ws(): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/ws',
            errors: {
                401: `Authentication information is missing or invalid`,
                418: `This code will never replied from the server. This response code only exists to document the schema of messages that are send by the server on the websocket.`,
            },
        });
    }

}
