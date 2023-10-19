/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseWizardStep } from './BaseWizardStep';
import type { WizardModeCondition } from './WizardModeCondition';
import type { WizardParameterCondition } from './WizardParameterCondition';

export type WizardSubStep = (BaseWizardStep & {
    name?: string;
    conditions: Array<(WizardModeCondition | WizardParameterCondition)>;
});

