/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Parameter } from './Parameter';
import type { TranslatedString } from './TranslatedString';
import type { WizardModeCondition } from './WizardModeCondition';
import type { WizardParameterCondition } from './WizardParameterCondition';

export type WizardStep = {
    id: string;
    name: TranslatedString;
    conditions?: Array<(WizardModeCondition | WizardParameterCondition)>;
    steps?: Array<WizardStep>;
    items?: Record<string, Parameter>;
};

