/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Channel } from './Channel';

export type Device = {
    displayName?: string;
    room?: string;
    floor?: string;
    articleNumber?: string;
    deviceId?: string;
    interface?: string;
    nativeId?: string;
    channels?: Record<string, Channel>;
    parameters?: Record<string, string>;
};

