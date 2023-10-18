/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SelectOption } from './SelectOption';
import type { TranslatedString } from './TranslatedString';

export type BasicParameter = {
    name: TranslatedString;
    type: 'BasicParameter';
    required?: boolean;
    description?: TranslatedString;
    default?: (string | number | boolean);
    dependsOn?: string;
    dependsOnValues?: Array<string>;
    dependsOnOptions?: Array<{
        values: Array<string>;
        options: SelectOption;
    }>;
};

