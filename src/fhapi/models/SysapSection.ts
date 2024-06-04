/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SysapSection = {
    sysapName: string;
    uartSerialNumber: string;
    testMode: boolean;
    version: string;
    sunRiseTimes: Array<number>;
    sunSetTimes: Array<number>;
    locale?: 'en' | 'es' | 'fr' | 'it' | 'nl' | 'de' | 'zh' | 'da' | 'fi' | 'nb' | 'pl' | 'pt' | 'ru' | 'sv' | 'el' | 'cs' | 'tr';
    location?: {
        latitude: number;
        longitude: number;
    };
};

