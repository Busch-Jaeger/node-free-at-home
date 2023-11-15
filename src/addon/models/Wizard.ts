/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranslatedName } from './TranslatedName';
import type { WizardStep } from './WizardStep';

export type Wizard = (TranslatedName & {
    name: string;
    create: boolean;
    edit: boolean;
    parameterGroups: Array<string>;
    steps: Array<WizardStep>;
});

