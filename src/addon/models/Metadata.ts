/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Parameters } from './Parameters';
import type { TranslatedString } from './TranslatedString';
import type { TranslatedUri } from './TranslatedUri';
import type { Wizards } from './Wizards';

export type Metadata = {
    version: string;
    id: string;
    name: TranslatedString;
    description: TranslatedString;
    license: string;
    author: string;
    url: TranslatedUri;
    supportUrl?: string;
    howtoUrl?: string;
    minSysapVersion?: string;
    accessControl?: {
        allowedAPIs?: Array<'webinterface' | 'serialport'>;
        networkAccess?: boolean;
        networkPorts?: Array<number>;
    };
    entryPoint: string;
    type: 'app' | 'runtime' | 'standalone';
    parameters?: Parameters;
    wizards?: Wizards;
    minAuxFileUploadIntervalMinutes?: number;
    organizationId?: string;
    rpc?: Array<string>;
};

