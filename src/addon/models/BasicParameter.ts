/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranslatedDescription } from './TranslatedDescription';
import type { TranslatedName } from './TranslatedName';

export type BasicParameter = (TranslatedName & TranslatedDescription & {
    type: 'string' | 'multilinestring' | 'password' | 'number' | 'boolean' | 'date' | 'time' | 'weekdays' | 'ipv4' | 'floor' | 'room' | 'channel' | 'select' | 'button' | 'text' | 'error' | 'description' | 'displayQRCode' | 'scanQRCode' | 'hidden' | 'jsonSelector';
    name: string;
    required?: boolean;
    default?: (string | number | boolean);
    dependsOn?: string;
    dependsOnValues?: Array<string>;
});

