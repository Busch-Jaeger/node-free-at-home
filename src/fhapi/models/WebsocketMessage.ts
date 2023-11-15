/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Devices } from './Devices';
import type { ScenesTriggered } from './ScenesTriggered';

export type WebsocketMessage = Record<string, {
    datapoints: Record<string, string>;
    devices: Record<string, Devices>;
    devicesAdded: Array<string>;
    devicesRemoved: Array<string>;
    scenesTriggered: ScenesTriggered;
    parameters?: Record<string, string>;
}>;
