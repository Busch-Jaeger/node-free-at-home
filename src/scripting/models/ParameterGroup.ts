/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Parameter } from './Parameter';
import type { TranslatedString } from './TranslatedString';

export type ParameterGroup = {
    name: TranslatedString;
    multiple?: boolean;
    items: Record<string, Parameter>;
};

