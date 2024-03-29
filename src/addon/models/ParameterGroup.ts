/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DisplayDependsOn } from './DisplayDependsOn';
import type { Parameter } from './Parameter';
import type { TranslatedError } from './TranslatedError';
import type { TranslatedName } from './TranslatedName';
import type { TranslatedSubtitle } from './TranslatedSubtitle';
import type { TranslatedTitle } from './TranslatedTitle';

export type ParameterGroup = (TranslatedName & {
    name: string;
    multiple?: boolean;
    /**
     * Show this parameter group only when debugging is enabled
     */
    debug?: boolean;
    display?: (TranslatedTitle & TranslatedSubtitle & TranslatedError & {
        dependsOn?: Record<string, DisplayDependsOn>;
    });
    items: Record<string, Parameter>;
});

