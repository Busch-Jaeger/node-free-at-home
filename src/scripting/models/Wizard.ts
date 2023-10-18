/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TranslatedString } from './TranslatedString';
import type { WizardStep } from './WizardStep';

export type Wizard = {
    name: TranslatedString;
    create: boolean;
    edit: boolean;
    sections: Array<string>;
    steps: Array<WizardStep>;
};

