/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranslatedName } from './TranslatedName';

export type SelectOption = (TranslatedName & {
    key: (string | number | boolean);
    name?: string;
    /**
     * Show this option only when debugging is enabled
     */
    debug?: boolean;
});

