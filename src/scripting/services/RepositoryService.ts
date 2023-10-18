/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Metadata } from '../models/Metadata';
import type { Reference } from '../models/Reference';
import type { References } from '../models/References';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class RepositoryService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Upload an add-on inside of a tar file
     * Upload an add-on inside of a tar file
     * @param formData
     * @returns Reference Success
     * @throws ApiError
     */
    public upload(
        formData?: {
            data: Blob;
        },
    ): CancelablePromise<Reference> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/ref',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad Request`,
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Get all add-on references
     * Get all an add-on references
     * @returns References Success
     * @throws ApiError
     */
    public getAddOn(): CancelablePromise<References> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/ref',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Get Metadata by references
     * Get Metadata by references
     * @param reference Add-on reference
     * @returns Metadata Success
     * @throws ApiError
     */
    public getMetadata(
        reference: Reference,
    ): CancelablePromise<Metadata> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/ref/{reference}',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                404: `Not Found`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Delete an add-on by references
     * Delete an add-on by references
     * @param reference add-on reference
     * @returns any Success
     * @throws ApiError
     */
    public deleteScript(
        reference: Reference,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/rest/ref/{reference}',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

}
