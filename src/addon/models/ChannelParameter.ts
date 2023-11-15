/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicParameter } from './BasicParameter';
import type { ChannelDatapoints } from './ChannelDatapoints';
import type { ChannelFunctionGroup } from './ChannelFunctionGroup';

export type ChannelParameter = (BasicParameter & {
    multiSelect?: boolean;
    filters?: Array<(ChannelFunctionGroup | ChannelDatapoints)>;
});

