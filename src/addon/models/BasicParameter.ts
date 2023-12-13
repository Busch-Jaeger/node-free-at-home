/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicDependsOnConfig } from './BasicDependsOnConfig';
import type { TranslatedDescription } from './TranslatedDescription';
import type { TranslatedName } from './TranslatedName';

export type BasicParameter = (TranslatedName & TranslatedDescription & {
    type: 'string' | 'multilinestring' | 'password' | 'number' | 'boolean' | 'date' | 'time' | 'weekdays' | 'ipv4' | 'floor' | 'room' | 'channel' | 'select' | 'button' | 'text' | 'error' | 'description' | 'displayQRCode' | 'scanQRCode' | 'hidden' | 'jsonSelector' | 'array' | 'svg' | 'uuid';
    name: string;
    required?: boolean;
    default?: (string | number | boolean);
    visible?: boolean;
    dependsOn?: string;
    rpc?: 'getParameterValue' | 'getParameterConfig';
    rpcCallOn?: 'initial' | 'everyChange';
    rpcAdditionalParameters?: Record<string, any>;
    dependsOnValues?: Array<(string | number | boolean)>;
    dependsOnConfig?: Array<BasicDependsOnConfig>;
});

