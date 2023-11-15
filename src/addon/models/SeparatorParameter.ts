/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranslatedDescription } from './TranslatedDescription';
import type { TranslatedName } from './TranslatedName';

export type SeparatorParameter = (TranslatedName & TranslatedDescription & {
    type: 'separator';
    dependsOn?: string;
    dependsOnValues?: Array<string>;
});

