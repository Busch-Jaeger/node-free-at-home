/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationState } from '../models/ApplicationState';
import type { Configuration } from '../models/Configuration';
import type { Event } from '../models/Event';
import type { Metadata } from '../models/Metadata';
import type { Reference } from '../models/Reference';
import type { Sha256 } from '../models/Sha256';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ContainerService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Create a container instance from a previous uploaded add-on
     * Create a container instance from a previous uploaded add-on
     * @param requestBody
     * @returns Metadata Success
     * @throws ApiError
     */
    public postContainer(
        requestBody?: Sha256,
    ): CancelablePromise<Metadata> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/container',
            body: requestBody,
            mediaType: 'text/plain',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * List all created container instances
     * List all created container instances
     * @returns Metadata Success
     * @throws ApiError
     */
    public getContainers(): CancelablePromise<Metadata> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/container',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Get the run time state of a container instance
     * List all created container instances
     * @param reference hash of commit sha256
     * @returns Metadata Success
     * @throws ApiError
     */
    public getContainerById(
        reference: Reference,
    ): CancelablePromise<Metadata> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/container/{reference}',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Delete a container instance by references
     * Delete a container by references
     * @param reference Container reference
     * @returns any Success
     * @throws ApiError
     */
    public deleteContainer(
        reference: Reference,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/rest/container/{reference}',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Get the configuration of a container
     * Get the configuration of a container
     * @param reference hash of commit sha256
     * @returns Configuration Success
     * @throws ApiError
     */
    public getContainerConfiguration(
        reference: Reference,
    ): CancelablePromise<Configuration> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/container/{reference}/configuration',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Set the configuration of a container
     * Set the configuration of a container
     * @param reference hash of commit sha256
     * @param requestBody
     * @returns Reference Success
     * @throws ApiError
     */
    public setContainerConfiguration(
        reference: Reference,
        requestBody?: Configuration,
    ): CancelablePromise<Reference> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/rest/container/{reference}/configuration',
            path: {
                'reference': reference,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Get the application state of a container
     * Get the application state of a container
     * @param reference hash of commit sha256
     * @returns ApplicationState Success
     * @throws ApiError
     */
    public getContainerApplicationState(
        reference: Reference,
    ): CancelablePromise<ApplicationState> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/container/{reference}/applicationstate',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Set the application state of a container
     * Set the application state of a container
     * @param reference hash of commit sha256
     * @param requestBody
     * @returns Reference Success
     * @throws ApiError
     */
    public setContainerApplicationState(
        reference: Reference,
        requestBody?: ApplicationState,
    ): CancelablePromise<Reference> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/rest/container/{reference}/applicationstate',
            path: {
                'reference': reference,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Get the events of a container
     * Get the events of a container
     * @param reference hash of commit sha256
     * @returns Event Success
     * @throws ApiError
     */
    public getContainerEvents(
        reference: Reference,
    ): CancelablePromise<Event> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/container/{reference}/events',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Set the events of a container
     * Set the events of a container
     * @param reference hash of commit sha256
     * @param requestBody
     * @returns Reference Success
     * @throws ApiError
     */
    public putContainerEvents(
        reference: Reference,
        requestBody?: Event,
    ): CancelablePromise<Reference> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/rest/container/{reference}/events',
            path: {
                'reference': reference,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Start a container
     * Start a container
     * @param reference hash of commit sha256
     * @returns Metadata Success
     * @throws ApiError
     */
    public startContainer(
        reference: Reference,
    ): CancelablePromise<Metadata> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/container/{reference}/start',
            path: {
                'reference': reference,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Bad Gateway error`,
            },
        });
    }

    /**
     * Stop a running container
     * Stop a running container
     * @param reference hash of commit sha256
     * @returns Metadata Success
     * @throws ApiError
     */
    public stopContainer(
        reference: Reference,
    ): CancelablePromise<Metadata> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/container/{reference}/stop',
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
