/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicDependsOnConfig } from './BasicDependsOnConfig';
import type { BasicParameter } from './BasicParameter';

export type NumberParameter = (BasicParameter & {
    min?: number;
    max?: number;
    dependsOnConfig?: Array<(BasicDependsOnConfig & {
        min?: number;
        max?: number;
    })>;
});

