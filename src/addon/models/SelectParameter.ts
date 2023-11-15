/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicDependsOnConfig } from './BasicDependsOnConfig';
import type { BasicParameter } from './BasicParameter';
import type { SelectOption } from './SelectOption';

export type SelectParameter = (BasicParameter & {
    options?: Array<SelectOption>;
    dependsOnConfig?: Array<(BasicDependsOnConfig & {
        options?: Array<SelectOption>;
    })>;
});

