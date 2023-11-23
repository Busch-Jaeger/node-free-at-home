/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Devices } from './Devices';
import type { Error } from './Error';
import type { Floors } from './Floors';
import type { SysapSection } from './SysapSection';
import type { Users } from './Users';

/**
 * SysAP
 */
export type SysAP = {
    sysap?: SysapSection;
    devices?: Devices;
    floorplan?: {
        floors?: Floors;
    };
    sysapName?: string;
    users?: Users;
    error?: Error;
};

