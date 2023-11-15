/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type WizardEvent = {
    eventType: 'wizard';
    wizard: string;
    state: 'started' | 'canceled' | 'finished';
    mode: 'create' | 'edit';
    active: boolean;
    index?: string;
};

