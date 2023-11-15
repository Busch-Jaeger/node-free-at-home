/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicDependsOnConfig } from './BasicDependsOnConfig';
import type { BasicParameter } from './BasicParameter';

export type StringParameter = (BasicParameter & {
    min?: number;
    max?: number;
    regex?: string;
    dependsOnConfig?: Array<(BasicDependsOnConfig & {
        min?: number;
        max?: number;
    })>;
});

