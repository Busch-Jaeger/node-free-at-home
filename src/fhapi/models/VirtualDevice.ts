/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { VirtualDeviceType } from './VirtualDeviceType';

export type VirtualDevice = {
    type: VirtualDeviceType;
    properties?: {
        ttl?: string;
        displayname?: string;
        flavor?: string;
        capabilities?: Array<number>;
    };
};

