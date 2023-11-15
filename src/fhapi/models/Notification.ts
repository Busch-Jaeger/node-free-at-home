/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NotificationContentEntry } from './NotificationContentEntry';

export type Notification = {
    formatVersion: number;
    topicId: string;
    timeoutMinutes: number;
    displayHints?: Array<'styleInfo' | 'styleWarn' | 'styleAlert' | 'modal' | 'fixed' | 'hideIfAnswered'>;
    retention: number;
    terminals: Array<'ui' | 'panel' | 'push-notification'>;
    subjectResource?: string;
    senderResource?: string;
    auxId?: string;
    content: {
        utf8?: {
            en?: NotificationContentEntry;
            es?: NotificationContentEntry;
            fr?: NotificationContentEntry;
            it?: NotificationContentEntry;
            nl?: NotificationContentEntry;
            de?: NotificationContentEntry;
            zh?: NotificationContentEntry;
            da?: NotificationContentEntry;
            fi?: NotificationContentEntry;
            nb?: NotificationContentEntry;
            pl?: NotificationContentEntry;
            pt?: NotificationContentEntry;
            ru?: NotificationContentEntry;
            sv?: NotificationContentEntry;
            el?: NotificationContentEntry;
            cs?: NotificationContentEntry;
            tr?: NotificationContentEntry;
        };
    };
};

