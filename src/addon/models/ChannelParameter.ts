/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicParameter } from './BasicParameter';
import type { ChannelDatapoints } from './ChannelDatapoints';
import type { ChannelFunctionGroup } from './ChannelFunctionGroup';

export type ChannelParameter = (BasicParameter & {
    /**
     * allow more than one channel
     */
    multiple?: boolean;
    /**
     * Minimum values that must be selected (default: 0)
     */
    minValues?: number;
    /**
     * Maximum values that can be selected (default: unlimited)
     */
    maxValues?: number;
    filters?: Array<(ChannelFunctionGroup | ChannelDatapoints)>;
});

