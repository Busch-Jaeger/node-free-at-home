import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

import { PairingIds } from '.';
import { Device } from './freeAtHomeApi';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class Channel extends (EventEmitter as { new(): ChannelEmitter }) {
    serialNumber: string = "";
    channelNumber: number;
    device: Device;

    private autoKeepAliveTimer: NodeJS.Timeout | undefined = undefined;

    public isAutoConfirm: boolean = false;

    constructor(device: Device, channelNumber: number) {
        super();
        this.device = device;
        this.channelNumber = channelNumber;
    }

    public setAutoKeepAlive(value: boolean) {
        if (value == true) {
            if (this.autoKeepAliveTimer === undefined)
                this.autoKeepAliveTimer = setInterval(() => {
                    this.triggerKeepAlive();
                }, 1000 * 120);
        } else {
            if (this.autoKeepAliveTimer !== undefined)
                clearInterval(this.autoKeepAliveTimer);
        }
    }

    protected setDatapoint(id: PairingIds, value: string) {
        const { channelNumber } = this;
        this.device.setOutputDatapoint(channelNumber, id, value);
    }

    public setUnresponsive() {
        this.device.setUnresponsive();
    }

    public triggerKeepAlive() {
        this.device.triggerKeepAlive();
    }
}