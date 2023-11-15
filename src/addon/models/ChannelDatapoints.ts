/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Datapoints } from './Datapoints';

export type ChannelDatapoints = {
    /**
     * Allow groups in the filtered list (input/output are inversed for filtering)
     */
    groups?: boolean;
    outputs?: {
        allOf?: Datapoints;
        anyOf?: Datapoints;
    };
    inputs?: {
        allOf?: Datapoints;
        anyOf?: Datapoints;
    };
};

