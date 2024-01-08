/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type WizardStepEvent = {
    eventType: 'wizardStep';
    wizard: string;
    state: 'entered' | 'exited';
    mode: 'create' | 'edit';
    key: string;
    data?: Record<string, any>;
};

