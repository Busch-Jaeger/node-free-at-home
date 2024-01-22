/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BasicDependsOnConfig } from './BasicDependsOnConfig';
import type { TranslatedButton } from './TranslatedButton';
import type { TranslatedDescription } from './TranslatedDescription';
import type { TranslatedName } from './TranslatedName';

export type BasicParameter = (TranslatedName & TranslatedDescription & TranslatedButton & {
    type: 'string' | 'multilinestring' | 'password' | 'number' | 'boolean' | 'date' | 'time' | 'weekdays' | 'ipv4' | 'floor' | 'room' | 'channel' | 'select' | 'button' | 'text' | 'error' | 'description' | 'displayQRCode' | 'scanQRCode' | 'hidden' | 'jsonSelector' | 'array' | 'svg' | 'uuid' | 'custom';
    name: string;
    required?: boolean;
    default?: (string | number | boolean);
    /**
     * Prefill this value with the last edited one
     */
    preFill?: boolean;
    visible?: boolean;
    dependsOn?: string;
    rpc?: 'getParameterValue' | 'getParameterConfig';
    rpcCallOn?: 'initial' | 'everyChange' | 'buttonPressed';
    rpcAdditionalParameters?: Record<string, any>;
    dependsOnValues?: Array<(string | number | boolean)>;
    dependsOnConfig?: Array<BasicDependsOnConfig>;
    /**
     * Only relevant when type == custom
     */
    customTypeName?: string;
    /**
     * Do not store this value but send it as an event when the button is pressed
     */
    event?: boolean;
    /**
     * parameter-scope (default) -> send only this parameter value, group-scope -> send all parameter values from the same group
     */
    eventScope?: 'parameter' | 'group';
    /**
     * When this is true the every change of the parameters value will be saved immediately (default: false)
     */
    saveOnChange?: boolean;
    /**
     * Show this parameter only when debugging is enabled
     */
    debug?: boolean;
});

