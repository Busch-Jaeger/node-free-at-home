/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Parameter } from './Parameter';
import type { TranslatedError } from './TranslatedError';
import type { TranslatedName } from './TranslatedName';
import type { TranslatedSubtitle } from './TranslatedSubtitle';
import type { TranslatedTitle } from './TranslatedTitle';

export type ParameterType = (TranslatedName & {
    name: string;
    display: (TranslatedTitle & TranslatedSubtitle & TranslatedError);
    items: Record<string, Parameter>;
});

