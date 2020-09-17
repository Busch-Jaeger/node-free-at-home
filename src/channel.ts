import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

import { PairingIds } from '.';
import { ApiVirtualChannel } from "./api/apiVirtualChannel";

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class Channel extends (EventEmitter as { new(): ChannelEmitter }) {
    channel: ApiVirtualChannel;

    private autoKeepAliveTimer: NodeJS.Timeout | undefined = undefined;

    public isAutoConfirm: boolean = false;

    constructor(channel: ApiVirtualChannel) {
        super();
        this.channel = channel;
    }

    public setAutoKeepAlive(value: boolean) {
        if (value == true) {
            if (this.autoKeepAliveTimer === undefined)
                this.autoKeepAliveTimer = setInterval( async() => {
                    try {
                        await this.triggerKeepAlive();
                    } catch (error) {
                        console.log(error);
                    }
                }, 1000 * 120);
        } else {
            if (this.autoKeepAliveTimer !== undefined)
                clearInterval(this.autoKeepAliveTimer);
        }
    }

    protected async setDatapoint(id: PairingIds, value: string) {
        return this.channel.setOutputDatapoint(id, value);
    }

    public async setUnresponsive() {
        return this.channel.setUnresponsive();
    }

    public async triggerKeepAlive() {
        return this.channel.triggerKeepAlive();
    }
}