/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InOutPut } from './InOutPut';

export type Channel = {
    displayName?: string;
    functionID?: string;
    room?: string;
    floor?: string;
    inputs?: Record<string, InOutPut>;
    outputs?: Record<string, InOutPut>;
    parameters?: Record<string, string>;
    type?: string;
};

