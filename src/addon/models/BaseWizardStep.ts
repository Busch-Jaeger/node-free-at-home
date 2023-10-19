/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Parameter } from './Parameter';
import type { TranslatedName } from './TranslatedName';
import type { WizardSubStep } from './WizardSubStep';

export type BaseWizardStep = (TranslatedName & {
    id: string;
    steps?: Array<WizardSubStep>;
    items?: Record<string, Parameter>;
});

