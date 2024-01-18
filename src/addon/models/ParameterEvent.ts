/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ParameterEvent = {
    eventType: 'parameterChanged';
    parameter: string;
    group: string;
    index?: string;
    value?: (string | number | boolean);
    data?: Record<string, any>;
};

