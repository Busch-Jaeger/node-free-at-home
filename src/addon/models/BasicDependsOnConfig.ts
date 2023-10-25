/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranslatedDescription } from './TranslatedDescription';
import type { TranslatedName } from './TranslatedName';

export type BasicDependsOnConfig = (TranslatedName & TranslatedDescription & {
    values: Array<string>;
    name?: string;
    required?: boolean;
    default?: (string | number | boolean);
    visible?: boolean;
});

